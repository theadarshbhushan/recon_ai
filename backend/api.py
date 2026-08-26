#!/usr/bin/env python3
"""
api.py
Razorpay AI Buildathon 2026 - AI Finance Controller
Part 6: FastAPI Wrapper

This script implements a minimal REST API to expose the reconciliation pipeline,
exception queues, diagnostic explorers, and model predictions as web service endpoints.
"""

import os
import sys
import subprocess
import joblib
import pandas as pd
import numpy as np
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import get_collection

# Global variables
cb_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once at startup to optimize inference latency."""
    global cb_model
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    model_path = os.path.join(ROOT_DIR, "models", "catboost_model.pkl")
    if os.path.exists(model_path):
        try:
            cb_model = joblib.load(model_path)
            print(f"CatBoost model loaded successfully at startup from {model_path}.")
        except Exception as e:
            print(f"Error loading CatBoost model at startup: {e}")
    else:
        print(f"Warning: model file {model_path} not found. Running predictions will fail until models.py is run.")
    yield

app = FastAPI(
    title="AI Finance Controller API 📊",
    description="REST API wrapping the AI-powered financial reconciliation pipeline, ML classifiers, and explanation layers.",
    version="1.0",
    lifespan=lifespan
)

# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class PredictRequest(BaseModel):
    gateway_amount: float = Field(..., description="Gateway transaction amount in INR", example=5000.0)
    payment_method: str = Field(..., description="Payment method: upi, card, netbanking, wallet, emi", example="upi")
    status: str = Field(..., description="Gateway status: success, partial_refund, refunded, failed", example="success")
    date_diff_days: int = Field(..., description="Settlement delay in days", example=1)
    batch_size: int = Field(..., description="Settlement batch component count", example=4)
    batch_residual_pct: float = Field(..., description="Batch residual deviation percentage", example=0.0)
    amount_diff_pct: float = Field(..., description="Transaction residual deviation percentage", example=0.0)
    refund_amount: Optional[float] = Field(0.0, description="Refund amount in INR (default is 0.0)", example=0.0)

class PredictResponse(BaseModel):
    confidence_score: float = Field(..., description="CatBoost clean class probability (0.0 to 1.0)")
    category: str = Field(..., description="Reconciliation exception category")
    severity: float = Field(..., description="Reconciliation severity score (0.0 to 1.0)")
    recommended_action: str = Field(..., description="Decision: auto_approve, flag_for_review, escalate")
    llm_explanation: str = Field(..., description="Plain-English explanation of the transaction audit outcome")

# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health", summary="Health Status Check")
def health():
    """Simple health check endpoint returning status ok."""
    return {"status": "ok"}

@app.post("/reconcile", summary="Trigger Full Pipeline Re-Run")
def reconcile(mode: str = Query("ground_truth", description="Reconciliation match mode: 'ground_truth' or 'hard'")):
    """
    Executes the complete matching engine and exception compilation pipeline on disk
    and returns a summary diagnostic of the reconciled dataset.
    """
    if mode not in ["ground_truth", "hard"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'ground_truth' or 'hard'.")
        
    try:
        ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        match_engine_script = os.path.join(ROOT_DIR, "backend", "match_engine.py")
        exception_queue_script = os.path.join(ROOT_DIR, "backend", "exception_queue.py")
        
        # Run Match Engine via subprocess to avoid CLI parsing collisions
        subprocess.run(["python", match_engine_script, "--mode", mode], check=True)
        # Run Exception Queue compiler
        subprocess.run(["python", exception_queue_script], check=True)
        
        # Connect to MongoDB collections
        col_gateway = get_collection("gateway_transactions")
        col_matched = get_collection("matched_pairs")
        col_exceptions = get_collection("exceptions")
        col_hm_diag = get_collection("hard_mode_diagnostics")
        
        total_gateway = col_gateway.count_documents({})
        total_matched = col_matched.count_documents({})
        total_exceptions = col_exceptions.count_documents({})
        
        # Sum of rupee amount at risk in exception queue
        pipeline = [{"$group": {"_id": None, "total_risk": {"$sum": "$rupee_amount"}}}]
        agg_res = list(col_exceptions.aggregate(pipeline))
        total_risk = agg_res[0]["total_risk"] if agg_res else 0.0
        
        # Match rates
        eligible_gateways = col_gateway.count_documents({"status": {"$in": ["success", "partial_refund"]}})
        gt_rate = (total_matched / eligible_gateways) * 100 if eligible_gateways > 0 else 0.0
        
        hm_rate = 0.0
        if mode == "hard" and col_hm_diag.count_documents({}) > 0:
            diag_pipeline = [
                {"$group": {
                    "_id": None,
                    "avg_matched": {"$avg": {"$cond": [{"$eq": ["$matched", True]}, 1.0, 0.0]}}
                }}
            ]
            hm_res = list(col_hm_diag.aggregate(diag_pipeline))
            hm_rate = (hm_res[0]["avg_matched"] * 100) if hm_res else 0.0
            
        top_5 = list(col_exceptions.find({}, {'_id': 0}).sort("severity_score", -1).limit(5))
        
        return {
            "status": "success",
            "summary": {
                "total_transactions": total_gateway,
                "match_rate_ground_truth_pct": round(gt_rate, 2),
                "match_rate_hard_mode_pct": round(hm_rate, 2),
                "total_exceptions": total_exceptions,
                "total_rupee_amount_at_risk": round(total_risk, 2)
            },
            "top_5_severity_exceptions": top_5
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {e}")

@app.get("/exceptions", summary="Retrieve Exception Queue")
def get_exceptions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category (exact match)"),
    min_severity: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum severity threshold")
):
    """
    Returns the unified, ranked exception queue. Highly configurable via pagination,
    severity sorting, and category filters.
    """
    try:
        col = get_collection("exceptions")
        
        query = {}
        if category:
            query["category"] = category
        if min_severity is not None:
            query["severity_score"] = {"$gte": min_severity}
            
        total_items = col.count_documents(query)
        total_pages = int(np.ceil(total_items / page_size))
        
        skip = (page - 1) * page_size
        items = list(col.find(query, {'_id': 0}).sort("severity_score", -1).skip(skip).limit(page_size))
        
        return {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "items": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading exceptions: {e}")

@app.get("/benchmark", summary="Retrieve Classifier Benchmarks")
def get_benchmark():
    """Returns the ML classifiers benchmarking results comparing F1, AUC, and latencies."""
    try:
        col = get_collection("benchmark_results")
        if col.count_documents({}) == 0:
            raise HTTPException(status_code=404, detail="Benchmark results not found in MongoDB.")
        return list(col.find({}, {'_id': 0}))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading benchmarks: {e}")

@app.get("/batch/{batch_id}", summary="Get Settlement Batch Details")
def get_batch(batch_id: str):
    """
    Loads diagnostic details for a specific settlement batch ID, detailing the matching method,
    residuals, and constituent transaction IDs.
    """
    try:
        col_bank = get_collection("bank_settlements")
        col_diag = get_collection("hard_mode_diagnostics")
        col_matched = get_collection("matched_pairs")
        
        bank_record = col_bank.find_one({"batch_id": batch_id}, {'_id': 0})
        if not bank_record:
            raise HTTPException(status_code=404, detail=f"Batch ID '{batch_id}' not found in bank settlements.")
            
        diag_record = col_diag.find_one({"batch_id": batch_id}, {'_id': 0})
        if not diag_record:
            diag_record = {
                "batch_id": batch_id,
                "merchant_id": bank_record["merchant_id"],
                "date": bank_record["settlement_date"],
                "candidate_pool_size": None,
                "method_used": "Ground Truth Mapping",
                "matched": True,
                "target_amount": float(bank_record["amount"]),
                "sum_of_matched_amounts": float(bank_record["amount"])
            }
            
        matches = col_matched.find({"batch_id": batch_id}, {"transaction_id": 1, "_id": 0})
        component_ids = [m["transaction_id"] for m in matches]
        
        return {
            "batch_id": batch_id,
            "bank_summary": {
                "merchant_id": bank_record["merchant_id"],
                "settlement_date": bank_record["settlement_date"],
                "amount": float(bank_record["amount"]),
                "utr_number": bank_record["utr_number"]
            },
            "hard_mode_diagnostics": diag_record,
            "matched_component_transaction_ids": component_ids
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving batch detail: {e}")

@app.post("/predict", response_model=PredictResponse, summary="Predict Single Transaction Status")
def predict(req: PredictRequest, explain: bool = Query(False, description="Call live Claude API if true, otherwise use sub-millisecond local templates")):
    """
    Submits a single transaction payload to the persisted CatBoost classifier model to predict
    whether it is 'clean' or 'anomalous'. Generates plain-English audits and recommended actions.
    """
    global cb_model
    if cb_model is None:
        raise HTTPException(
            status_code=503, 
            detail="Inference model not loaded. Please ensure models/catboost_model.pkl is present and restart the server."
        )
        
    try:
        # 1. Feature Engineering
        gateway_amount = req.gateway_amount
        refund_amount = req.refund_amount
        status = req.status
        payment_method = req.payment_method
        date_diff_days = req.date_diff_days
        batch_size = req.batch_size
        batch_residual_pct = req.batch_residual_pct
        amount_diff_pct = req.amount_diff_pct
        
        # expected settled amount
        if status in ['failed', 'refunded']:
            expected_settled_amount = 0.0
        else:
            net_amt = gateway_amount - refund_amount
            if net_amt <= 0:
                expected_settled_amount = 0.0
            else:
                fee = net_amt * 0.029
                gst = fee * 0.18
                expected_settled_amount = net_amt - fee - gst
                
        # batch amount
        if expected_settled_amount > 0:
            batch_amount = expected_settled_amount / (1 + batch_residual_pct / 100)
        else:
            batch_amount = 0.0
            
        # allocated amount
        allocated_amount = expected_settled_amount * (1 + amount_diff_pct / 100)
        
        # Construct Pandas DataFrame for CatBoost
        row_dict = {
            'gateway_amount': float(gateway_amount),
            'refund_amount': float(refund_amount),
            'expected_settled_amount': float(expected_settled_amount),
            'batch_amount': float(batch_amount),
            'allocated_amount': float(allocated_amount),
            'amount_diff_pct': float(amount_diff_pct),
            'batch_residual_pct': float(batch_residual_pct),
            'date_diff_days': int(date_diff_days),
            'batch_size': int(batch_size),
            'payment_method': str(payment_method),
            'status': str(status)
        }
        
        df_input = pd.DataFrame([row_dict])
        
        # 2. ML Inference
        clean_prob = cb_model.predict_proba(df_input)[0, 1]
        anomaly_prob = 1.0 - clean_prob
        
        # Normalize amount to calculate severity score
        a_min = 1.0
        a_max = 50000.0
        try:
            col_ex = get_collection("exceptions")
            min_max_pipeline = [
                {"$group": {
                    "_id": None,
                    "min_amount": {"$min": "$rupee_amount"},
                    "max_amount": {"$max": "$rupee_amount"}
                }}
            ]
            agg_ex = list(col_ex.aggregate(min_max_pipeline))
            if agg_ex:
                a_min = agg_ex[0]["min_amount"] or 1.0
                a_max = agg_ex[0]["max_amount"] or 50000.0
        except Exception:
            pass
            
        denom = a_max - a_min if a_max != a_min else 1.0
        a_norm = (gateway_amount - a_min) / denom
        a_norm = max(0.0, min(1.0, a_norm))
        
        severity_score = 0.4 * anomaly_prob + 0.6 * a_norm
        
        # 3. Categorization & Explanation
        if clean_prob >= 0.7:
            category = "none (clean transaction)"
            rec_action = "auto_approve"
            llm_exp = "Reconciliation checks passed successfully. Transaction matches bank batch allocations within normal operational tolerances."
        else:
            if abs(batch_residual_pct) >= 0.5:
                category = 'likely_batch_decomposition_error'
            elif date_diff_days > 2:
                category = 'timing_drift'
            elif abs(amount_diff_pct) > 0.1:
                category = 'likely_fee_mismatch'
            elif status == 'partial_refund':
                category = 'likely_refund_timing_anomaly'
            else:
                category = 'unexplained'
                
            # Explain
            from backend.exception_queue import explain_exception
            api_key = os.environ.get("ANTHROPIC_API_KEY") if explain else None
            
            features = {
                "transaction_id_or_settlement_id": "TXN_API_LIVE",
                "category": category,
                "rupee_amount": float(gateway_amount),
                "amount_diff_pct": float(amount_diff_pct),
                "batch_residual_pct": float(batch_residual_pct),
                "date_diff_days": float(date_diff_days),
                "severity_score": float(severity_score)
            }
            
            exp_res = explain_exception(features, api_key)
            llm_exp = exp_res['llm_explanation']
            rec_action = exp_res['recommended_action']
            
        # Log to MongoDB live_predictions collection for audit trail
        try:
            col_live = get_collection("live_predictions")
            log_doc = {
                "request": req.model_dump(),
                "response": {
                    "confidence_score": round(float(clean_prob), 4),
                    "category": category,
                    "severity": round(float(severity_score), 4),
                    "recommended_action": rec_action,
                    "llm_explanation": llm_exp
                }
            }
            col_live.insert_one(log_doc)
        except Exception as log_err:
            print(f"Failed to log live prediction: {log_err}")
            
        return PredictResponse(
            confidence_score=round(float(clean_prob), 4),
            category=category,
            severity=round(float(severity_score), 4),
            recommended_action=rec_action,
            llm_explanation=llm_exp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline failed: {e}")

if __name__ == "__main__":
    import uvicorn
    # Specify the target module backend.api for hot-reloads to run properly
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)
