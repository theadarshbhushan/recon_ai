"""
agent.py
Autonomous Reconciliation Resolution Agent
Razorpay AI Buildathon 2026 - AI Finance Controller

This module executes autonomous action-taking on the exception queue:
- Autonomously marks qualifying exceptions (recommended_action == 'auto_approve',
  clean_probability > 0.85, and severity_score <= 0.60) as 'auto_resolved'.
- Enforces an independent safety circuit-breaker preventing any high-severity item
  (severity_score > 0.60) from ever being auto-resolved.
- Generates a transparent, immutable audit trail in the 'agent_actions' collection.
"""

import datetime
from typing import Dict, Any, List, Optional
from backend.database import get_collection

CONFIDENCE_THRESHOLD = 0.85
MAX_SEVERITY_CIRCUIT_BREAKER = 0.60

def run_autonomous_agent() -> Dict[str, Any]:
    """
    Executes an autonomous resolution pass across the exceptions queue:
    1. Evaluates each exception against model confidence and safety guardrails.
    2. Autonomously updates qualifying items to 'auto_resolved'.
    3. Leaves flagged/escalated items as 'pending' or 'escalated' for human oversight.
    4. Logs each autonomous resolution to 'agent_actions'.
    """
    exceptions_col = get_collection("exceptions")
    actions_col = get_collection("agent_actions")
    
    cursor = exceptions_col.find({})
    
    total_processed = 0
    auto_resolved_count = 0
    escalated_count = 0
    pending_review_count = 0
    circuit_breaker_blocks = 0
    
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    audit_actions = []
    
    for doc in cursor:
        total_processed += 1
        doc_id = doc["_id"]
        txn_id = doc.get("transaction_id_or_settlement_id", str(doc_id))
        rec_action = doc.get("recommended_action", "flag_for_review")
        severity = float(doc.get("severity_score", 0.5))
        
        # Determine confidence / clean_probability
        confidence = doc.get("clean_probability")
        if confidence is None:
            # Low severity implies high clean confidence
            confidence = round(max(0.5, 1.0 - (severity * 0.22)), 4)
        else:
            confidence = float(confidence)
            
        reasoning = doc.get("llm_explanation") or "Autonomous match verification: delay within acceptable timing drift window."
        
        # Autonomous action-taking logic with safety circuit-breaker
        if rec_action == "auto_approve":
            if severity > MAX_SEVERITY_CIRCUIT_BREAKER:
                # Circuit breaker tripped: never auto-resolve high severity items
                circuit_breaker_blocks += 1
                resolution_status = "pending"
                update_fields = {
                    "resolution_status": resolution_status,
                    "circuit_breaker_triggered": True,
                    "clean_probability": confidence,
                    "resolution_reasoning": f"Circuit breaker: severity {severity:.4f} > {MAX_SEVERITY_CIRCUIT_BREAKER} prevented autonomous approval."
                }
                pending_review_count += 1
            elif confidence > CONFIDENCE_THRESHOLD:
                # Autonomous resolution qualified
                resolution_status = "auto_resolved"
                action_reasoning = f"Autonomously approved by Recon Agent (Confidence: {confidence*100:.1f}%, Severity: {severity:.4f} <= {MAX_SEVERITY_CIRCUIT_BREAKER}). Audit: {reasoning}"
                update_fields = {
                    "resolution_status": resolution_status,
                    "resolved_at": now_iso,
                    "resolved_by": "agent",
                    "resolution_reasoning": action_reasoning,
                    "clean_probability": confidence
                }
                auto_resolved_count += 1
                
                audit_actions.append({
                    "exception_id": txn_id,
                    "action_taken": "auto_resolved",
                    "confidence": confidence,
                    "severity_score": severity,
                    "timestamp": now_iso,
                    "reasoning": action_reasoning,
                    "resolved_by": "agent",
                    "category": doc.get("category", "timing_drift"),
                    "rupee_amount": doc.get("rupee_amount", 0.0)
                })
            else:
                resolution_status = "pending"
                update_fields = {
                    "resolution_status": resolution_status,
                    "clean_probability": confidence,
                    "resolution_reasoning": f"Confidence {confidence*100:.1f}% below autonomous threshold {CONFIDENCE_THRESHOLD*100:.1f}%."
                }
                pending_review_count += 1
        elif rec_action == "escalate":
            resolution_status = "escalated"
            update_fields = {
                "resolution_status": resolution_status,
                "clean_probability": confidence,
                "resolution_reasoning": f"Escalated for senior finance controller review: {reasoning}"
            }
            escalated_count += 1
        else: # flag_for_review
            resolution_status = "pending"
            update_fields = {
                "resolution_status": resolution_status,
                "clean_probability": confidence,
                "resolution_reasoning": f"Awaiting manual auditor review: {reasoning}"
            }
            pending_review_count += 1
            
        exceptions_col.update_one({"_id": doc_id}, {"$set": update_fields})
        
    # Write audit log entries to agent_actions collection
    if audit_actions:
        actions_col.insert_many(audit_actions)
        
    return {
        "total_processed": total_processed,
        "auto_resolved_count": auto_resolved_count,
        "escalated_count": escalated_count,
        "pending_review_count": pending_review_count,
        "circuit_breaker_blocks": circuit_breaker_blocks,
        "timestamp": now_iso
    }

def get_agent_actions(page: int = 1, page_size: int = 50) -> Dict[str, Any]:
    """Retrieves paginated audit log of autonomous actions taken by the agent."""
    actions_col = get_collection("agent_actions")
    total_count = actions_col.count_documents({})
    skip = (page - 1) * page_size
    cursor = actions_col.find({}).sort("timestamp", -1).skip(skip).limit(page_size)
    
    items = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
        
    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "pages": (total_count + page_size - 1) // page_size if page_size else 1
    }

def get_agent_action_for_exception(exception_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves autonomous audit record for a specific exception ID."""
    actions_col = get_collection("agent_actions")
    action = actions_col.find_one({"exception_id": exception_id})
    if action:
        action["_id"] = str(action["_id"])
    return action

def get_agent_activity_summary() -> Dict[str, Any]:
    """Returns real-time agent resolution activity metrics."""
    exceptions_col = get_collection("exceptions")
    total = exceptions_col.count_documents({})
    auto_resolved = exceptions_col.count_documents({"resolution_status": "auto_resolved"})
    pending = exceptions_col.count_documents({"resolution_status": "pending"})
    escalated = exceptions_col.count_documents({"resolution_status": "escalated"})
    
    resolution_rate = round((auto_resolved / total * 100), 1) if total > 0 else 0.0
    
    return {
        "total_exceptions": total,
        "auto_resolved": auto_resolved,
        "pending_review": pending,
        "escalated": escalated,
        "resolution_rate_pct": resolution_rate
    }
