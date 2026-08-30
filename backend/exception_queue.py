#!/usr/bin/env python3
"""
exception_queue.py
Razorpay AI Buildathon 2026 - AI Finance Controller
Part 4: Exception Queue + LLM Explanation Layer

This script builds a unified, ranked, and explained exception queue by aggregating:
1. Low-confidence matched pairs (CatBoost clean probability < 0.7)
2. Unmatched gateway transactions (missing settlements)
3. Unmatched bank settlements (batch decomposition errors)
4. Duplicate ledger entries

It runs Claude (via Anthropic API) to generate plain-English explanations
and recommended actions, falling back to a structured template generator if the API is offline.
"""

import os
import json
import sys
import time
import requests
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
import warnings

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Suppress warnings
warnings.filterwarnings('ignore')

def parse_args():
    import argparse
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_dir = os.path.join(ROOT_DIR, "data")
    
    parser = argparse.ArgumentParser(
        description="Build a ranked and explained exception queue using ML & LLMs."
    )
    parser.add_argument(
        "-d", "--datadir",
        type=str,
        default=default_dir,
        help=f"Input/Output directory containing data files (default: {default_dir})"
    )
    parser.add_argument(
        "-c", "--confidence-threshold",
        type=float,
        default=0.7,
        help="CatBoost clean confidence threshold (default: 0.7)"
    )
    return parser.parse_args()

def generate_fallback_explanation(item):
    """Fallback template-based explanation when LLM API call fails or is not configured."""
    category = item['category']
    amt = item['rupee_amount']
    diff = item['amount_diff_pct']
    res = item['batch_residual_pct']
    days = item['date_diff_days']
    
    if category == 'missing_settlement':
        explanation = f"Gateway transaction of {amt:.2f} INR has no matching bank settlement batch."
        action = 'escalate'
    elif category == 'likely_fee_mismatch':
        explanation = f"Settled amount deviates from expected by {diff:.2f}%, suggesting potential processing fee mismatch."
        action = 'flag_for_review'
    elif category == 'likely_batch_decomposition_error':
        explanation = f"Batch residual of {res:.2f}% suggests a batch decomposition error or missing components."
        action = 'flag_for_review'
    elif category == 'timing_drift':
        explanation = f"Settlement delay of {days:.0f} days is outside the normal T+2 window."
        if days >= 8 or item.get('severity_score', 0.0) > 0.7:
            action = 'escalate'
        else:
            action = 'auto_approve'
    elif category == 'duplicate_ledger_entry':
        explanation = f"Identified duplicate ledger records sharing the same order ID in internal ledger."
        action = 'flag_for_review'
    elif category == 'likely_refund_timing_anomaly':
        explanation = f"Partial refund transaction of {amt:.2f} INR requires manual verification of split refund ledger entries."
        action = 'flag_for_review'
    else:
        explanation = f"Unexplained reconciliation mismatch (amount diff: {diff:.2f}%, residual: {res:.2f}%)."
        action = 'flag_for_review'
        
    return explanation, action

def call_claude_batch(batch_items, api_key):
    """Query Claude Messages API to explain exceptions and recommend actions in strict JSON format."""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    input_data = []
    for item in batch_items:
        input_data.append({
            "id": item["transaction_id_or_settlement_id"],
            "category": item["category"],
            "rupee_amount": round(item["rupee_amount"], 2),
            "amount_diff_pct": round(item["amount_diff_pct"], 2) if not pd.isna(item["amount_diff_pct"]) else 0.0,
            "batch_residual_pct": round(item["batch_residual_pct"], 2) if not pd.isna(item["batch_residual_pct"]) else 0.0,
            "date_diff_days": int(item["date_diff_days"]) if not pd.isna(item["date_diff_days"]) else 0,
            "severity_score": f"{round(item['severity_score'], 4)} (0=low urgency, 1=high urgency)"
        })
        
    system_prompt = (
        "You are an AI Finance Controller reconciliation auditor. Return ONLY valid JSON, no markdown formatting, no preamble. "
        "Analyze the list of transaction exceptions. For each object in the input array, return a corresponding JSON object with:\n"
        "1) 'id': matching the input 'id' exactly,\n"
        "2) 'llm_explanation': a single-sentence plain-English explanation of the mismatch based on the metrics,\n"
        "3) 'recommended_action': strictly choose from: 'auto_approve', 'flag_for_review', 'escalate'.\n\n"
        "Crucial Action Constraints:\n"
        "- The 'severity_score' reflects how urgent/high-risk this exception is.\n"
        "- Items with severity_score above 0.6 should NEVER be recommended as auto_approve — use flag_for_review or escalate instead.\n"
        "- Items with severity_score below 0.3 may be auto_approve if the explanation supports it.\n\n"
        "Return a single JSON array of these objects."
    )
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 4000,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": f"Analyze these exceptions: {json.dumps(input_data)}"}
        ]
    }
    
    max_retries = 3
    backoff = 2
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                text_content = result['content'][0]['text']
                parsed = json.loads(text_content.strip())
                return {item['id']: item for item in parsed}
            elif response.status_code == 429:
                time.sleep(backoff)
                backoff *= 2
            else:
                time.sleep(backoff)
                backoff *= 2
        except Exception as e:
            time.sleep(backoff)
            backoff *= 2
            
    raise RuntimeError("Anthropic API failed after retries")

def explain_exception(features: dict, api_key: str) -> dict:
    """Explain a single exception live using Claude or a fallback template."""
    if api_key:
        try:
            res_dict = call_claude_batch([features], api_key)
            item_id = features['transaction_id_or_settlement_id']
            if item_id in res_dict:
                exp = res_dict[item_id]["llm_explanation"]
                act = res_dict[item_id]["recommended_action"]
                
                act = str(act).lower().strip()
                if features.get('severity_score', 0.0) > 0.6 and act == 'auto_approve':
                    act = 'flag_for_review'
                    if exp:
                        exp = exp.rstrip('.') + " [Action auto-corrected due to high severity]."
                return {
                    "llm_explanation": exp,
                    "recommended_action": act
                }
        except Exception as e:
            pass
            
    exp, act = generate_fallback_explanation(features)
    act = str(act).lower().strip()
    if features.get('severity_score', 0.0) > 0.6 and act == 'auto_approve':
        act = 'flag_for_review'
        if exp:
            exp = exp.rstrip('.') + " [Action auto-corrected due to high severity]."
            
    return {
        "llm_explanation": exp,
        "recommended_action": act
    }

def main():
    args = parse_args()
    
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    matched_path = os.path.join(args.datadir, "matched_pairs.csv")
    unmatched_gway_path = os.path.join(args.datadir, "unmatched_gateway.csv")
    unmatched_bank_path = os.path.join(args.datadir, "unmatched_bank.csv")
    ledger_path = os.path.join(args.datadir, "ledger.csv")
    
    # -------------------------------------------------------------------------
    # PART 1: Load CatBoost model and extract Matched Anomalies
    # -------------------------------------------------------------------------
    from backend.database import get_collection
    try:
        col = get_collection("matched_pairs")
        if col.count_documents({}) > 0:
            print("Loading matched pairs from MongoDB...")
            df_matched = pd.DataFrame(list(col.find({}, {'_id': 0})))
        else:
            raise RuntimeError("Collection is empty")
    except Exception as e:
        print(f"MongoDB matched_pairs load failed ({e}). Falling back to local CSV...")
        df_matched = pd.read_csv(matched_path)
    
    df_matched['label'] = (
        (df_matched['status'] == 'success') & 
        (df_matched['batch_residual_pct'].abs() < 0.5) & 
        (df_matched['date_diff_days'] >= 0) & 
        (df_matched['date_diff_days'] <= 2)
    ).astype(int)
    
    numeric_features = [
        'gateway_amount', 'refund_amount', 'expected_settled_amount', 
        'batch_amount', 'allocated_amount', 'amount_diff_pct', 
        'batch_residual_pct', 'date_diff_days', 'batch_size'
    ]
    categorical_features = ['payment_method', 'status']
    all_features = numeric_features + categorical_features
    
    X = df_matched[all_features].copy()
    y = df_matched['label'].copy()
    
    # Try to load pre-trained CatBoost model from disk
    import joblib
    models_dir = os.path.join(ROOT_DIR, "models")
    model_path = os.path.join(models_dir, "catboost_model.pkl")
    
    if os.path.exists(model_path):
        print(f"Loading pre-trained CatBoost model from {model_path}...")
        cb_model = joblib.load(model_path)
    else:
        print("Pre-trained CatBoost model not found. Training a new model on the fly...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, stratify=y, random_state=42
        )
        X_train_cb = X_train.copy()
        X_train_cb[categorical_features] = X_train_cb[categorical_features].astype(str)
        cb_model = CatBoostClassifier(
            iterations=100,
            learning_rate=0.1,
            depth=6,
            verbose=0,
            random_seed=42,
            cat_features=categorical_features
        )
        cb_model.fit(X_train_cb, y_train)
    
    # Predict probabilities on all matched pairs
    X_cb = X.copy()
    X_cb[categorical_features] = X_cb[categorical_features].astype(str)
    df_matched['clean_probability'] = cb_model.predict_proba(X_cb)[:, 1]
    
    df_matched_anom = df_matched[df_matched['clean_probability'] < args.confidence_threshold].copy()
    print(f"Matched anomalies found (< {args.confidence_threshold} confidence): {len(df_matched_anom)} rows")
    
    # -------------------------------------------------------------------------
    # PART 2: Load exception files and duplicate ledger entries
    # -------------------------------------------------------------------------
    print("Loading unmatched records and detecting duplicate ledger entries...")
    try:
        df_unmatched_gway = pd.read_csv(unmatched_gway_path)
    except pd.errors.EmptyDataError:
        df_unmatched_gway = pd.DataFrame(columns=['transaction_id', 'merchant_id', 'amount', 'currency', 'timestamp', 'payment_method', 'status'])
        
    try:
        df_unmatched_bank = pd.read_csv(unmatched_bank_path)
    except pd.errors.EmptyDataError:
        df_unmatched_bank = pd.DataFrame(columns=['settlement_id', 'utr_number', 'batch_id', 'merchant_id', 'amount', 'settlement_date', 'component_txn_ids', 'n_components'])
        
    try:
        col_ledger = get_collection("ledger_entries")
        if col_ledger.count_documents({}) > 0:
            print("Loading ledger entries from MongoDB...")
            df_ledger = pd.DataFrame(list(col_ledger.find({}, {'_id': 0})))
        else:
            raise RuntimeError("Collection is empty")
    except Exception as e:
        print(f"MongoDB ledger_entries load failed ({e}). Falling back to local CSV...")
        df_ledger = pd.read_csv(ledger_path)
    
    dup_mask = df_ledger.duplicated(
        subset=['order_id', 'expected_amount', 'entry_date', 'category'], 
        keep='first'
    )
    df_dup_ledger = df_ledger[dup_mask].copy()
    print(f"Duplicate ledger entries identified: {len(df_dup_ledger)} rows")
    
    # -------------------------------------------------------------------------
    # PART 3: Standardize and merge into a single exception queue
    # -------------------------------------------------------------------------
    exception_records = []
    
    # Source 1: Matched anomalies
    for idx, row in df_matched_anom.iterrows():
        if abs(row['batch_residual_pct']) >= 0.5:
            cat = 'likely_batch_decomposition_error'
        elif row['date_diff_days'] > 2:
            cat = 'timing_drift'
        elif abs(row['amount_diff_pct']) > 0.1:
            cat = 'likely_fee_mismatch'
        elif row['status'] == 'partial_refund':
            cat = 'likely_refund_timing_anomaly'
        else:
            cat = 'unexplained'
            
        exception_records.append({
            "transaction_id_or_settlement_id": row['transaction_id'],
            "category": cat,
            "rupee_amount": row['gateway_amount'],
            "anomaly_probability": 1.0 - row['clean_probability'],
            "amount_diff_pct": row['amount_diff_pct'],
            "batch_residual_pct": row['batch_residual_pct'],
            "date_diff_days": row['date_diff_days']
        })
        
    # Source 2: Unmatched gateways (missing settlements)
    for idx, row in df_unmatched_gway.iterrows():
        exception_records.append({
            "transaction_id_or_settlement_id": row['transaction_id'],
            "category": 'missing_settlement',
            "rupee_amount": row['amount'],
            "anomaly_probability": 1.0,
            "amount_diff_pct": np.nan,
            "batch_residual_pct": np.nan,
            "date_diff_days": np.nan
        })
        
    # Source 3: Unmatched bank settlements
    for idx, row in df_unmatched_bank.iterrows():
        exception_records.append({
            "transaction_id_or_settlement_id": row['settlement_id'],
            "category": 'likely_batch_decomposition_error',
            "rupee_amount": row['amount'],
            "anomaly_probability": 1.0,
            "amount_diff_pct": np.nan,
            "batch_residual_pct": 100.0,
            "date_diff_days": np.nan
        })
        
    # Source 4: Duplicate ledger entries
    for idx, row in df_dup_ledger.iterrows():
        exception_records.append({
            "transaction_id_or_settlement_id": row['order_id'],
            "category": 'duplicate_ledger_entry',
            "rupee_amount": abs(row['expected_amount']),
            "anomaly_probability": 1.0,
            "amount_diff_pct": np.nan,
            "batch_residual_pct": np.nan,
            "date_diff_days": np.nan
        })
        
    df_exceptions = pd.DataFrame(exception_records)
    
    if df_exceptions.empty:
        print("No exceptions identified. Exception queue is empty.")
        return
        
    # -------------------------------------------------------------------------
    # PART 4: Severity Scoring and Ranking
    # -------------------------------------------------------------------------
    a_min = df_exceptions['rupee_amount'].min()
    a_max = df_exceptions['rupee_amount'].max()
    denom = a_max - a_min if a_max != a_min else 1.0
    
    a_norm = (df_exceptions['rupee_amount'] - a_min) / denom
    df_exceptions['severity_score'] = 0.4 * df_exceptions['anomaly_probability'] + 0.6 * a_norm
    
    df_exceptions = df_exceptions.sort_values(by='severity_score', ascending=False).reset_index(drop=True)
    df_exceptions['rank'] = df_exceptions.index + 1
    
    # -------------------------------------------------------------------------
    # PART 5: LLM Explanation Layer
    # -------------------------------------------------------------------------
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    explanations = {}
    actions = {}
    
    if api_key:
        print("\nAnthropic API key found. Querying Claude to explain exceptions...")
        batch_size = 15
        records = df_exceptions.to_dict('records')
        
        for idx in range(0, len(records), batch_size):
            batch = records[idx : idx + batch_size]
            print(f" - Processing batch {idx // batch_size + 1}/{(len(records) - 1) // batch_size + 1} ({len(batch)} items)...")
            
            try:
                batch_response = call_claude_batch(batch, api_key)
                for item_id, res in batch_response.items():
                    explanations[item_id] = res.get('llm_explanation')
                    actions[item_id] = res.get('recommended_action')
            except Exception as e:
                print(f"    Batch failed: {e}. Falling back to template explanations.")
                for item in batch:
                    item_id = item['transaction_id_or_settlement_id']
                    exp, act = generate_fallback_explanation(item)
                    explanations[item_id] = exp
                    actions[item_id] = act
    else:
        print("\n[Notice] ANTHROPIC_API_KEY environment variable not configured.")
        print("Falling back to local template-based explanation layer.")
        for idx, row in df_exceptions.iterrows():
            item_id = row['transaction_id_or_settlement_id']
            exp, act = generate_fallback_explanation(row)
            explanations[item_id] = exp
            actions[item_id] = act
            
    final_exps = []
    final_acts = []
    for idx, row in df_exceptions.iterrows():
        item_id = row['transaction_id_or_settlement_id']
        exp = explanations.get(item_id)
        act = actions.get(item_id)
        
        if pd.isna(exp) or pd.isna(act):
            exp, act = generate_fallback_explanation(row)
            
        act = str(act).lower().strip()
        
        if row['severity_score'] > 0.6 and act == 'auto_approve':
            act = 'flag_for_review'
            if exp:
                exp = exp.rstrip('.') + " [Action auto-corrected due to high severity]."
                
        final_exps.append(exp)
        final_acts.append(act)
        
    df_exceptions['llm_explanation'] = final_exps
    df_exceptions['recommended_action'] = final_acts
    
    # -------------------------------------------------------------------------
    # PART 6: Save Output and Print Summary
    # -------------------------------------------------------------------------
    output_cols = [
        'rank', 'transaction_id_or_settlement_id', 'category', 
        'severity_score', 'rupee_amount', 'llm_explanation', 'recommended_action'
    ]
    df_final = df_exceptions[output_cols]
    
    out_path = os.path.join(args.datadir, "exception_queue.csv")
    df_final.to_csv(out_path, index=False)
    
    # Save exceptions to MongoDB exceptions collection
    try:
        col_exc = get_collection("exceptions")
        col_exc.delete_many({})
        df_clean = df_final.replace({np.nan: None})
        col_exc.insert_many(df_clean.to_dict(orient="records"))
        print(f"Exception queue successfully saved to MongoDB collection 'exceptions'")
    except Exception as e:
        print(f"Error saving exceptions to MongoDB: {e}")
    
    print("\n" + "="*80)
    print("                    EXCEPTION QUEUE SUMMARY REPORT")
    print("="*80)
    print(f"Total exceptions identified: {len(df_final)}")
    print(f"Total rupee amount at risk:  {df_final['rupee_amount'].sum():,.2f} INR")
    
    print("\nBreakdown count by category:")
    cat_counts = df_final['category'].value_counts()
    for cat, count in cat_counts.items():
        print(f" - {cat}: {count} items")
        
    print("\nRecommended actions breakdown:")
    action_counts = df_final['recommended_action'].value_counts()
    for action, count in action_counts.items():
        print(f" - {action}: {count} items")
        
    print("\nTop 5 Highest Severity Exceptions in Queue:")
    print(df_final.head(5).to_string(index=False))
    print("="*80)
    print(f"Exceptions successfully saved to {out_path}\n")

if __name__ == "__main__":
    main()
