#!/usr/bin/env python3
"""
generate_data.py
Razorpay AI Buildathon 2026 - AI Finance Controller
Part 1: Synthetic Data Generator

This script generates three linked CSV files (gateway.csv, bank.csv, ledger.csv)
representing transaction, bank settlement, and internal ledger data. It models
realistic fintech mismatches including processing fees, settlement delays,
partial refunds, batching, missing settlements, duplicates, and stray entries.
"""

import argparse
import os
import random
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def parse_args():
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_outdir = os.path.join(ROOT_DIR, "data")
    
    parser = argparse.ArgumentParser(
        description="Generate synthetic financial transaction data for reconciliation testing."
    )
    parser.add_argument(
        "-n", "--num-transactions",
        type=int,
        default=1000,
        help="Number of gateway transactions to generate (default: 1000)"
    )
    parser.add_argument(
        "-s", "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)"
    )
    parser.add_argument(
        "-o", "--outdir",
        type=str,
        default=default_outdir,
        help=f"Output directory for generated CSV files (default: {default_outdir})"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    # 1. Setup seeds for reproducibility
    np.random.seed(args.seed)
    random.seed(args.seed)
    
    n = args.num-transactions if hasattr(args, 'num-transactions') else args.num_transactions
    if n <= 0:
        raise ValueError("Number of transactions must be greater than 0.")
        
    outdir = args.outdir
    os.makedirs(outdir, exist_ok=True)
    
    print(f"Generating synthetic financial datasets...")
    print(f"Configuration: N={n}, Seed={args.seed}, Outdir={outdir}")
    
    # Define constants
    START_DATE = datetime(2026, 8, 1)
    DAYS_RANGE = 30
    MERCHANTS = ["merch_01", "merch_02", "merch_03"]
    PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet", "emi"]
    PM_WEIGHTS = [0.50, 0.30, 0.10, 0.05, 0.05]
    
    STATUSES = ["success", "refunded", "failed", "partial_refund"]
    STATUS_WEIGHTS = [0.86, 0.06, 0.04, 0.04]
    
    FEE_PCT = 0.029
    GST_PCT = 0.18
    
    # -------------------------------------------------------------------------
    # PART 1: Generate Gateway Transactions (gateway.csv)
    # -------------------------------------------------------------------------
    
    # Generating IDs
    txn_ids = [f"TXN_{10000 + i}" for i in range(1, n + 1)]
    
    # Generate merchant distribution
    merchants = np.random.choice(MERCHANTS, size=n)
    
    # Generate amount using exponential distribution to mimic real transaction behaviors (more small txns)
    # Scale=3000, minimum amount = 100
    raw_amounts = np.random.exponential(scale=3000, size=n) + 100
    amounts = np.round(raw_amounts, 2)
    
    # Generate currencies
    currencies = ["INR"] * n
    
    # Generate timestamps
    timestamps = []
    for _ in range(n):
        random_seconds = np.random.randint(0, DAYS_RANGE * 24 * 3600)
        txn_time = START_DATE + timedelta(seconds=int(random_seconds))
        timestamps.append(txn_time)
        
    # Sort timestamps to make data chronological
    timestamps.sort()
    
    # Generate payment methods and statuses
    payment_methods = np.random.choice(PAYMENT_METHODS, size=n, p=PM_WEIGHTS)
    statuses = np.random.choice(STATUSES, size=n, p=STATUS_WEIGHTS)
    
    # Assemble gateway dataframe
    df_gateway = pd.DataFrame({
        "transaction_id": txn_ids,
        "merchant_id": merchants,
        "amount": amounts,
        "currency": currencies,
        "timestamp": timestamps,
        "payment_method": payment_methods,
        "status": statuses
    })
    
    # Sort df_gateway chronologically
    df_gateway = df_gateway.sort_values(by="timestamp").reset_index(drop=True)
    
    # Store partial refund amounts mapping to keep it consistent between bank and ledger
    refund_amounts = {}
    for idx, row in df_gateway.iterrows():
        if row["status"] == "partial_refund":
            # refund fraction between 10% and 90%
            refund_frac = np.random.uniform(0.1, 0.9)
            ref_amt = np.round(row["amount"] * refund_frac, 2)
            refund_amounts[row["transaction_id"]] = ref_amt
            
    # -------------------------------------------------------------------------
    # PART 2: Generate Bank Settlements (bank.csv)
    # -------------------------------------------------------------------------
    
    # Eligible for settlement: success and partial_refund
    df_eligible = df_gateway[df_gateway["status"].isin(["success", "partial_refund"])].copy()
    
    # Inject ~3% missing settlements
    # Select transactions that will NEVER settle (representing missing settlement exception)
    is_missing = np.random.rand(len(df_eligible)) < 0.03
    df_settled_txns = df_eligible[~is_missing].copy()
    
    # Add transaction date for grouping
    df_settled_txns["txn_date"] = df_settled_txns["timestamp"].dt.date
    
    settlements = []
    settlement_counter = 20001
    batch_counter = 30001
    utr_counter = 100000001
    
    # Group by merchant and txn_date
    grouped = df_settled_txns.groupby(["merchant_id", "txn_date"])
    
    for (merchant_id, txn_date), group in grouped:
        # Sort group by transaction_id or timestamp to be consistent
        group = group.sort_values("transaction_id")
        txns_list = group.to_dict("records")
        
        # Batching: group transactions on a given day into batches (average size ~4)
        i = 0
        while i < len(txns_list):
            # Choose batch size
            batch_size = np.random.choice([2, 3, 4, 5, 6], p=[0.1, 0.2, 0.4, 0.2, 0.1])
            if len(txns_list) - i < batch_size:
                batch_size = len(txns_list) - i
                
            batch_txns = txns_list[i : i + batch_size]
            i += batch_size
            
            # Compute net amounts, fee deductions, and total settled amount
            comp_ids = []
            total_settled_amount = 0.0
            
            for txn in batch_txns:
                tid = txn["transaction_id"]
                comp_ids.append(tid)
                
                # Base amount to settle
                amt = txn["amount"]
                if txn["status"] == "partial_refund":
                    # Reduce by partial refund amount
                    refund_val = refund_amounts[tid]
                    net_amt = np.round(amt - refund_val, 2)
                else:
                    net_amt = amt
                    
                # Calculate fees: 2.9% fee + 18% GST on fee
                fee = np.round(net_amt * FEE_PCT, 2)
                gst = np.round(fee * GST_PCT, 2)
                total_deductions = fee + gst
                
                # Settled amount for this component
                settled_amt = np.round(net_amt - total_deductions, 2)
                settled_amt = max(0.01, settled_amt) # Ensure non-negative/non-zero
                total_settled_amount += settled_amt
                
            total_settled_amount = np.round(total_settled_amount, 2)
            
            # Determine settlement date (T+1, T+2, T+3 delay)
            delay = np.random.choice([1, 2, 3], p=[0.70, 0.20, 0.10])
            settlement_date = txn_date + timedelta(days=int(delay))
            
            # Append bank settlement record
            settlements.append({
                "settlement_id": f"SET_{settlement_counter}",
                "utr_number": f"UTR999{utr_counter}",
                "batch_id": f"BAT_{batch_counter}",
                "merchant_id": merchant_id,
                "amount": total_settled_amount,
                "settlement_date": settlement_date.strftime("%Y-%m-%d"),
                "component_txn_ids": ";".join(comp_ids),
                "n_components": len(comp_ids)
            })
            
            settlement_counter += 1
            batch_counter += 1
            utr_counter += 1
            
    df_bank = pd.DataFrame(settlements)
    
    # -------------------------------------------------------------------------
    # PART 3: Generate Ledger Entries (ledger.csv)
    # -------------------------------------------------------------------------
    
    # Ledger records array
    ledger_entries = []
    ledger_counter = 40001
    
    # Create entries for every transaction in gateway
    for idx, row in df_gateway.iterrows():
        tid = row["transaction_id"]
        amt = row["amount"]
        txn_date = row["timestamp"].date()
        
        # 1. Main sales entry
        ledger_entries.append({
            "ledger_entry_id": f"LEDG_{ledger_counter}",
            "order_id": tid,
            "expected_amount": amt,
            "entry_date": txn_date.strftime("%Y-%m-%d"),
            "category": "sales"
        })
        ledger_counter += 1
        
        # 2. Refund entries (represent debits in internal records)
        if row["status"] in ["refunded", "partial_refund"]:
            # Refund date: sale date + 1-5 days delay
            ref_delay = np.random.randint(1, 6)
            ref_date = txn_date + timedelta(days=ref_delay)
            
            # Expected refund amount (negative value in ledger)
            ref_amt = amt if row["status"] == "refunded" else refund_amounts[tid]
            
            ledger_entries.append({
                "ledger_entry_id": f"LEDG_{ledger_counter}",
                "order_id": tid,
                "expected_amount": -ref_amt,
                "entry_date": ref_date.strftime("%Y-%m-%d"),
                "category": "refund"
            })
            ledger_counter += 1

    # Inject ~2% accidental duplicates in ledger
    num_duplicates = int(len(ledger_entries) * 0.02)
    duplicate_indices = np.random.choice(len(ledger_entries), size=num_duplicates, replace=False)
    
    duplicate_entries = []
    for idx in duplicate_indices:
        original = ledger_entries[idx]
        duplicate_entry = original.copy()
        # Give it a unique ledger entry ID, but keep order_id and other business keys the same
        duplicate_entry["ledger_entry_id"] = f"LEDG_{ledger_counter}"
        ledger_counter += 1
        duplicate_entries.append(duplicate_entry)
        
    ledger_entries.extend(duplicate_entries)
    
    # Inject a handful of manual/stray entries (15 total)
    stray_categories = ["manual_adjustment", "chargeback_reversal", "bank_charge"]
    for i in range(15):
        random_days = np.random.randint(0, DAYS_RANGE)
        stray_date = START_DATE + timedelta(days=random_days)
        category = np.random.choice(stray_categories)
        
        # Charges are negative, adjustments/reversals positive or negative
        if category == "bank_charge":
            stray_amount = np.round(-np.random.uniform(10, 500), 2)
        elif category == "chargeback_reversal":
            stray_amount = np.round(np.random.uniform(500, 5000), 2)
        else: # manual_adjustment
            stray_amount = np.round(np.random.uniform(-2000, 2000), 2)
            
        ledger_entries.append({
            "ledger_entry_id": f"LEDG_{ledger_counter}",
            "order_id": f"STRAY_ORD_{8000 + i}",
            "expected_amount": stray_amount,
            "entry_date": stray_date.strftime("%Y-%m-%d"),
            "category": category
        })
        ledger_counter += 1
        
    df_ledger = pd.DataFrame(ledger_entries)
    
    # -------------------------------------------------------------------------
    # Save CSVs to output directory
    # -------------------------------------------------------------------------
    
    gateway_path = os.path.join(outdir, "gateway.csv")
    bank_path = os.path.join(outdir, "bank.csv")
    ledger_path = os.path.join(outdir, "ledger.csv")
    
    df_gateway.to_csv(gateway_path, index=False)
    df_bank.to_csv(bank_path, index=False)
    df_ledger.to_csv(ledger_path, index=False)
    
    print(f"\nFiles generated successfully in {outdir}:")
    print(f" - gateway.csv: {len(df_gateway)} rows")
    print(f" - bank.csv: {len(df_bank)} rows")
    print(f" - ledger.csv: {len(df_ledger)} rows")
    
    # -------------------------------------------------------------------------
    # PART 4: Verification / Diagnostic Report
    # -------------------------------------------------------------------------
    
    print("\n--- Diagnostic & Validation Report ---")
    
    # Status distributions in gateway
    status_counts = df_gateway["status"].value_counts()
    status_pct = df_gateway["status"].value_counts(normalize=True) * 100
    print("Gateway status distribution:")
    for status in STATUSES:
        count = status_counts.get(status, 0)
        pct = status_pct.get(status, 0.0)
        print(f" - {status}: {count} ({pct:.2f}%)")
        
    # Expected vs Actual missing settlements (3%)
    actual_settled_ids = set()
    for ids in df_bank["component_txn_ids"]:
        actual_settled_ids.update(ids.split(";"))
        
    eligible_ids = set(df_eligible["transaction_id"])
    missing_settlement_ids = eligible_ids - actual_settled_ids
    missing_settlement_pct = (len(missing_settlement_ids) / len(eligible_ids)) * 100 if eligible_ids else 0
    print(f"Eligible transactions for settlement: {len(eligible_ids)}")
    print(f"Settled transaction count: {len(actual_settled_ids)}")
    print(f"Missing settlements (true exceptions): {len(missing_settlement_ids)} ({missing_settlement_pct:.2f}%)")
    
    # Duplicate entries count
    duplicate_order_ids = df_ledger[df_ledger.duplicated(subset=["order_id", "expected_amount", "entry_date", "category"], keep=False)]
    num_dup_orders = duplicate_order_ids["order_id"].nunique()
    print(f"Accidental duplicates in ledger: {len(duplicate_entries)} entries duplicated (spanning {num_dup_orders} unique orders)")
    
    # Stray entries count
    stray_entries = df_ledger[df_ledger["category"].isin(stray_categories)]
    print(f"Manual/stray entries in ledger: {len(stray_entries)} rows (categories: {stray_entries['category'].value_counts().to_dict()})")
    
    # Average components per settlement batch
    avg_components = df_bank["n_components"].mean() if len(df_bank) > 0 else 0
    print(f"Average components per bank settlement batch: {avg_components:.2f}")

if __name__ == "__main__":
    main()
