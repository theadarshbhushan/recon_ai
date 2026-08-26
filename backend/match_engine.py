#!/usr/bin/env python3
"""
match_engine.py
Razorpay AI Buildathon 2026 - AI Finance Controller
Part 2: Matching Engine

This script reconciles payment gateway transactions (gateway.csv) and bank
settlement records (bank.csv), utilizing internal ledger data (ledger.csv)
to extract refund amounts. It supports both "ground_truth" (using component list)
and "hard" (solving subset-sum combinatorial matching) modes.
"""

import argparse
import os
import itertools
import bisect
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def parse_args():
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_dir = os.path.join(ROOT_DIR, "data")
    
    parser = argparse.ArgumentParser(
        description="Reconcile gateway transactions with bank settlements."
    )
    parser.add_argument(
        "-m", "--mode",
        choices=["ground_truth", "hard"],
        default="ground_truth",
        help="Matching mode: 'ground_truth' (trust batch list) or 'hard' (solve subset-sum) (default: ground_truth)"
    )
    parser.add_argument(
        "-d", "--datadir",
        type=str,
        default=default_dir,
        help=f"Input directory containing gateway.csv, bank.csv, ledger.csv (default: {default_dir})"
    )
    parser.add_argument(
        "-o", "--outdir",
        type=str,
        default=default_dir,
        help=f"Output directory for results (default: {default_dir})"
    )
    parser.add_argument(
        "-t", "--tolerance",
        type=float,
        default=0.10,
        help="Matching tolerance for subset-sum in INR (default: 0.10)"
    )
    return parser.parse_args()

def compute_expected_settled(amount, status, refund_amount=0.0):
    """Calculate the expected settled amount after deducting processing fees and GST."""
    if status == 'partial_refund':
        net_amt = round(amount - refund_amount, 2)
    elif status == 'success':
        net_amt = amount
    else:
        return 0.0
        
    fee = round(net_amt * 0.029, 2)
    gst = round(fee * 0.18, 2)
    settled = round(net_amt - (fee + gst), 2)
    return max(0.01, settled)

def solve_subset_sum(candidates, target, tolerance=0.10):
    """
    Find a subset of candidates whose expected settled amounts sum to the target
    within a specified tolerance. Returns tuple (matched_subset, method_used) or None.
    """
    # Prune candidates that are larger than target + tolerance
    candidates = [c for c in candidates if c['expected_settled_amount'] <= target + tolerance]
    
    n = len(candidates)
    if n == 0:
        return None
        
    # Check if sum of all candidates is less than target - tolerance
    total_sum = sum(c['expected_settled_amount'] for c in candidates)
    if total_sum < target - tolerance:
        return None
        
    # If total sum is within tolerance, all candidates are the match
    if abs(total_sum - target) <= tolerance:
        return candidates, 'total_sum_match'
        
    # Standard combinatorial search for small pools (<= 15)
    if n <= 15:
        best_diff = float('inf')
        best_combo = None
        for k in range(1, n + 1):
            for combo in itertools.combinations(candidates, k):
                combo_sum = sum(c['expected_settled_amount'] for c in combo)
                diff = abs(combo_sum - target)
                if diff <= tolerance:
                    if diff < best_diff:
                        best_diff = diff
                        best_combo = combo
            if best_combo is not None and best_diff < 1e-5:
                return list(best_combo), 'exact_combinatorial'
        if best_combo is not None:
            return list(best_combo), 'exact_combinatorial'
            
    # Meet-in-the-middle for medium pools (15 < n <= 36)
    elif n <= 36:
        # Split
        half = n // 2
        left = candidates[:half]
        right = candidates[half:]
        
        # Enumerate left
        left_subsets = []
        for r in range(len(left) + 1):
            for combo in itertools.combinations(left, r):
                left_subsets.append((sum(c['expected_settled_amount'] for c in combo), list(combo)))
        left_subsets.sort(key=lambda x: x[0])
        left_sums = [x[0] for x in left_subsets]
        
        best_diff = float('inf')
        best_combo = None
        
        # Enumerate right
        for r in range(len(right) + 1):
            for combo_r in itertools.combinations(right, r):
                sum_r = sum(c['expected_settled_amount'] for c in combo_r)
                desired_l = target - sum_r
                
                idx = bisect.bisect_left(left_sums, desired_l)
                for i in [idx - 1, idx]:
                    if 0 <= i < len(left_sums):
                        sum_l, combo_l = left_subsets[i]
                        total = sum_l + sum_r
                        diff = abs(total - target)
                        if diff <= tolerance:
                            if diff < best_diff:
                                best_diff = diff
                                best_combo = combo_l + list(combo_r)
                                if diff < 1e-5:
                                    return best_combo, 'meet_in_the_middle'
        if best_combo is not None:
            return best_combo, 'meet_in_the_middle'
            
    # Greedy nearest-fit fallback for large pools (> 36)
    sorted_candidates = sorted(candidates, key=lambda x: x['expected_settled_amount'], reverse=True)
    selected = []
    current_sum = 0.0
    for c in sorted_candidates:
        if current_sum + c['expected_settled_amount'] <= target + tolerance:
            selected.append(c)
            current_sum += c['expected_settled_amount']
            if abs(current_sum - target) <= tolerance:
                return selected, 'greedy_fallback'
                
    if abs(current_sum - target) <= tolerance:
        return selected, 'greedy_fallback'
        
    return None

def main():
    args = parse_args()
    
    # Paths
    gateway_path = os.path.join(args.datadir, "gateway.csv")
    bank_path = os.path.join(args.datadir, "bank.csv")
    ledger_path = os.path.join(args.datadir, "ledger.csv")
    
    # Load datasets from MongoDB with fallback to local CSVs
    from backend.database import get_collection
    try:
        col_gateway = get_collection("gateway_transactions")
        col_bank = get_collection("bank_settlements")
        col_ledger = get_collection("ledger_entries")
        
        if col_gateway.count_documents({}) > 0 and col_bank.count_documents({}) > 0 and col_ledger.count_documents({}) > 0:
            print("Loading datasets from MongoDB database collections...")
            df_gateway = pd.DataFrame(list(col_gateway.find({}, {'_id': 0})))
            df_bank = pd.DataFrame(list(col_bank.find({}, {'_id': 0})))
            df_ledger = pd.DataFrame(list(col_ledger.find({}, {'_id': 0})))
            
            # Format component_txn_ids as a semicolon-separated string for matching logic compatibility
            df_bank['component_txn_ids'] = df_bank['component_txn_ids'].apply(
                lambda x: ';'.join(x) if isinstance(x, list) else x
            )
        else:
            raise RuntimeError("Database collections are empty")
    except Exception as db_err:
        print(f"MongoDB connection failed ({db_err}). Falling back to local CSV files...")
        if not (os.path.exists(gateway_path) and os.path.exists(bank_path) and os.path.exists(ledger_path)):
            raise FileNotFoundError(f"Ensure gateway.csv, bank.csv, and ledger.csv exist in {args.datadir}")
        df_gateway = pd.read_csv(gateway_path)
        df_bank = pd.read_csv(bank_path)
        df_ledger = pd.read_csv(ledger_path)
    
    print(f"Matching Engine Mode: {args.mode.upper()}")
    
    # Ensure datetimes are parsed correctly
    df_gateway['timestamp'] = pd.to_datetime(df_gateway['timestamp'])
    df_bank['settlement_date'] = pd.to_datetime(df_bank['settlement_date']).dt.date
    df_gateway['txn_date'] = df_gateway['timestamp'].dt.date
    
    # -------------------------------------------------------------------------
    # PART 1: Map refunds from ledger to enrich gateway transactions
    # -------------------------------------------------------------------------
    # Extract refund expected amounts (negative in ledger)
    df_refunds = df_ledger[df_ledger['category'] == 'refund']
    refund_map = df_refunds.groupby('order_id')['expected_amount'].sum().abs().to_dict()
    
    # Enrich gateway with refund amount and calculate expected settled amounts
    expected_settled_list = []
    refund_vals = []
    for idx, row in df_gateway.iterrows():
        tid = row['transaction_id']
        ref_val = refund_map.get(tid, 0.0)
        refund_vals.append(ref_val)
        
        exp_settled = compute_expected_settled(row['amount'], row['status'], ref_val)
        expected_settled_list.append(exp_settled)
        
    df_gateway['refund_amount'] = refund_vals
    df_gateway['expected_settled_amount'] = expected_settled_list
    
    # -------------------------------------------------------------------------
    # PART 2: Stage 1 Batch Decomposition
    # -------------------------------------------------------------------------
    matched_pairs = []
    unmatched_bank_rows = []
    matched_gway_ids = set()
    
    # Index gateway for fast lookups
    gateway_records = df_gateway.to_dict('records')
    gateway_by_id = {r['transaction_id']: r for r in gateway_records}
    
    # If hard mode, group gateway candidates for faster filtering
    # candidates pool is success/partial_refund
    eligible_gway = [r for r in gateway_records if r['status'] in ['success', 'partial_refund']]
    
    if args.mode == "ground_truth":
        for idx, bank_row in df_bank.iterrows():
            comp_ids_str = bank_row['component_txn_ids']
            if pd.isna(comp_ids_str):
                unmatched_bank_rows.append(bank_row)
                continue
                
            comp_ids = comp_ids_str.split(';')
            batch_txns = []
            
            for tid in comp_ids:
                if tid in gateway_by_id:
                    batch_txns.append(gateway_by_id[tid])
                    matched_gway_ids.add(tid)
                    
            if not batch_txns:
                unmatched_bank_rows.append(bank_row)
                continue
                
            # Process matching features for this batch
            process_batch_matches(bank_row, batch_txns, matched_pairs)
            
    else: # HARD MODE
        # Reconcile bank settlements chronologically to avoid duplicate mappings
        df_bank_sorted = df_bank.sort_values(by='settlement_date').reset_index(drop=True)
        
        diagnostics = []
        
        for idx, bank_row in df_bank_sorted.iterrows():
            merchant_id = bank_row['merchant_id']
            settlement_date = bank_row['settlement_date']
            target_amount = bank_row['amount']
            batch_id = bank_row['batch_id']
            
            # Test candidate dates S-1, S-2, S-3 one by one to keep candidate pool small and exact
            cand_dates = [settlement_date - timedelta(days=d) for d in [1, 2, 3]]
            
            # Count candidate pool size across all three candidate dates for diagnostics
            all_cands_pool = [
                g for g in eligible_gway 
                if g['merchant_id'] == merchant_id 
                and g['txn_date'] in cand_dates 
                and g['transaction_id'] not in matched_gway_ids
            ]
            total_candidates_checked = len(all_cands_pool)
            
            matched_subset = None
            chosen_method = 'failed'
            matched_sum = 0.0
            matched = False
            
            for dt in cand_dates:
                candidates = [
                    g for g in eligible_gway 
                    if g['merchant_id'] == merchant_id 
                    and g['txn_date'] == dt 
                    and g['transaction_id'] not in matched_gway_ids
                ]
                
                # Solve subset sum for this single date's pool
                res = solve_subset_sum(candidates, target_amount, args.tolerance)
                if res is not None:
                    matched_subset, chosen_method = res
                    break
            
            if matched_subset is not None:
                matched = True
                matched_sum = sum(g['expected_settled_amount'] for g in matched_subset)
                # Register matched transactions
                for g in matched_subset:
                    matched_gway_ids.add(g['transaction_id'])
                # Process features
                process_batch_matches(bank_row, matched_subset, matched_pairs)
            else:
                unmatched_bank_rows.append(bank_row)
                
            # Log diagnostics
            diagnostics.append({
                "batch_id": batch_id,
                "merchant_id": merchant_id,
                "date": str(settlement_date),
                "candidate_pool_size": total_candidates_checked,
                "method_used": chosen_method,
                "matched": matched,
                "target_amount": target_amount,
                "sum_of_matched_amounts": round(matched_sum, 2)
            })
            
    # -------------------------------------------------------------------------
    # PART 3: Stage 3 Exception Classification
    # -------------------------------------------------------------------------
    # Unmatched gateways: success/partial_refund that were never matched to a batch
    unmatched_gateways = [
        g for g in eligible_gway if g['transaction_id'] not in matched_gway_ids
    ]
    
    # Dataframes
    df_matched = pd.DataFrame(matched_pairs)
    df_unmatched_gway = pd.DataFrame(unmatched_gateways)
    df_unmatched_bank = pd.DataFrame(unmatched_bank_rows)
    
    # Ensure columns order and drop temporary helper columns
    helper_cols = ['txn_date']
    for df in [df_matched, df_unmatched_gway]:
        if not df.empty:
            for col in helper_cols:
                if col in df.columns:
                    df.drop(columns=[col], inplace=True)
                    
    # Save CSVs
    os.makedirs(args.outdir, exist_ok=True)
    matched_out = os.path.join(args.outdir, "matched_pairs.csv")
    unmatched_gway_out = os.path.join(args.outdir, "unmatched_gateway.csv")
    unmatched_bank_out = os.path.join(args.outdir, "unmatched_bank.csv")
    
    # Save to CSVs
    df_matched.to_csv(matched_out, index=False)
    df_unmatched_gway.to_csv(unmatched_gway_out, index=False)
    df_unmatched_bank.to_csv(unmatched_bank_out, index=False)
    
    # Save to MongoDB collections
    def save_df_to_mongodb(df, collection_name):
        try:
            col = get_collection(collection_name)
            col.delete_many({}) # clear existing documents
            df_clean = df.replace({np.nan: None})
            records = df_clean.to_dict(orient="records")
            if records:
                col.insert_many(records)
                print(f"Successfully saved {len(records)} documents to MongoDB collection '{collection_name}'")
        except Exception as e:
            print(f"Error saving to MongoDB collection '{collection_name}': {e}")
            
    save_df_to_mongodb(df_matched, "matched_pairs")
    
    # Save Hard Mode diagnostics if in hard mode
    if args.mode == "hard":
        df_diag = pd.DataFrame(diagnostics)
        diag_out = os.path.join(args.outdir, "hard_mode_diagnostics.csv")
        df_diag.to_csv(diag_out, index=False)
        save_df_to_mongodb(df_diag, "hard_mode_diagnostics")
        print(f"Hard mode diagnostics successfully saved to {diag_out}")
        
        # Summary calculations
        total_batches = len(df_diag)
        method_counts = df_diag['method_used'].value_counts()
        print("\n--- Hard Mode Decomposition Method Breakdown ---")
        for method, count in method_counts.items():
            pct = (count / total_batches) * 100
            print(f" - {method}: {count} batches ({pct:.2f}%)")
            
        print("\n--- Match Success Rate per Method ---")
        success_by_method = df_diag.groupby('method_used')['matched'].mean() * 100
        for method, rate in success_by_method.items():
            print(f" - {method}: {rate:.2f}% success rate")
            
    # -------------------------------------------------------------------------
    # Diagnostic Report
    # -------------------------------------------------------------------------
    print("\n--- Match Engine Diagnostic Report ---")
    print(f"Total matched pairs created: {len(df_matched)}")
    print(f"Unmatched gateway transactions (success/partial_refund): {len(df_unmatched_gway)}")
    print(f"Unmatched bank settlements: {len(df_unmatched_bank)}")
    
    if not df_matched.empty:
        print("\nStatistics for amount_diff_pct:")
        print(df_matched['amount_diff_pct'].describe())
        print("\nStatistics for batch_residual_pct:")
        print(df_matched['batch_residual_pct'].describe())
    else:
        print("\nNo matched pairs to report stats on.")

def process_batch_matches(bank_row, batch_txns, matched_pairs):
    """Perform proportional allocation and calculate validation features for a matched batch."""
    batch_amount = bank_row['amount']
    settlement_id = bank_row['settlement_id']
    utr_number = bank_row['utr_number']
    batch_id = bank_row['batch_id']
    settlement_date = bank_row['settlement_date']
    
    # Sum of expected settled amounts
    sum_expected = sum(t['expected_settled_amount'] for t in batch_txns)
    
    # Proportional Allocation
    allocated_shares = []
    for t in batch_txns:
        if sum_expected > 0:
            share = batch_amount * (t['expected_settled_amount'] / sum_expected)
        else:
            share = batch_amount / len(batch_txns)
        allocated_shares.append(round(share, 2))
        
    # Correct rounding residuals
    allocated_sum = sum(allocated_shares)
    residue = round(batch_amount - allocated_sum, 2)
    if residue != 0.0 and len(batch_txns) > 0:
        # Add residual to the transaction with the largest expected settled amount
        idx_max = np.argmax([t['expected_settled_amount'] for t in batch_txns])
        allocated_shares[idx_max] = round(allocated_shares[idx_max] + residue, 2)
        
    # Batch residual health check
    # sum of expected settled in batch vs actual batch amount
    if batch_amount > 0:
        batch_residual_pct = ((sum_expected - batch_amount) / batch_amount) * 100
    else:
        batch_residual_pct = 0.0
        
    # Append matches
    for i, t in enumerate(batch_txns):
        allocated_amt = allocated_shares[i]
        expected_amt = t['expected_settled_amount']
        
        # amount_diff_pct
        if expected_amt > 0:
            amount_diff_pct = ((allocated_amt - expected_amt) / expected_amt) * 100
        else:
            amount_diff_pct = 0.0
            
        # date_diff_days
        txn_date_obj = t['timestamp'].date() if isinstance(t['timestamp'], datetime) else datetime.strptime(str(t['timestamp'])[:10], '%Y-%m-%d').date()
        date_diff = (settlement_date - txn_date_obj).days
        
        matched_pairs.append({
            "transaction_id": t['transaction_id'],
            "merchant_id": t['merchant_id'],
            "gateway_amount": t['amount'],
            "currency": t['currency'],
            "timestamp": t['timestamp'].strftime("%Y-%m-%d %H:%M:%S") if hasattr(t['timestamp'], 'strftime') else str(t['timestamp']),
            "payment_method": t['payment_method'],
            "status": t['status'],
            "refund_amount": t['refund_amount'],
            "expected_settled_amount": expected_amt,
            "settlement_id": settlement_id,
            "utr_number": utr_number,
            "batch_id": batch_id,
            "batch_amount": batch_amount,
            "settlement_date": str(settlement_date),
            "allocated_amount": allocated_amt,
            "amount_diff_pct": round(amount_diff_pct, 4),
            "batch_residual_pct": round(batch_residual_pct, 4),
            "date_diff_days": date_diff,
            "batch_size": len(batch_txns)
        })

if __name__ == "__main__":
    main()
