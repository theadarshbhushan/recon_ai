# Recon AI - Pitch Presentation Script Outline 🎤

**Duration**: 5 Minutes (300 seconds)  
**Track**: Razorpay AI Buildathon 2026 — AI Finance Controller  
**Goal**: Walk judges through the business logic, machine learning pipeline, live interaction, and honest engineering retrospectives of Recon AI.

---

## ⏱️ Timeline & Section Breakdown

```
[0:00] ── 30s: Problem Framing (Verification Bottleneck)
[0:30] ── 60s: Dashboard Walkthrough (Overview + Model Benchmarks)
[1:30] ── 90s: Live Demo Tab (Clean vs. Anomalous Checks)
[3:00] ── 60s: Failure Recovery (MITM Solver, Collisions & Safety Overrides)
[4:00] ── 30s: Closing & Vision
[4:30]
```

---

## 🎙️ Section-by-Section Outline & Script

### 1. Problem Framing & The Hook (0:00 - 0:30 | 30s)
* **Visuals**: Show the custom sidebar and landing layout of the Streamlit dashboard on port `8501`. Hover over the "System Pipeline: Live" status indicator.
* **Key Spoken Points**:
  > *"Every merchant reconciles money across disconnected sources: payment gateways, bank settlement batches, and internal ledger logs. This is still done manually at most companies. As transaction volumes surge, the bottleneck in finance operations isn't **generation speed**, it is **verification capacity**.*
  >
  > *Meet **Recon AI**—an end-to-end reconciliation engine that automates 3-way matching, compiles anomalous exception queues, and uses ML classifiers and LLMs to explain exceptions in plain English."*

---

### 2. Dashboard Walkthrough (0:30 - 1:30 | 60s)
* **Visuals**: Walk through the **Overview** tab KPI metrics (Total Rupee Reconciled, Match Rate, Rupee at Risk) and scroll down to show the Daily Volume area chart. Click on the **Model Benchmarks** tab and hover over the F1-Score and training/inference time (log-scale) charts.
* **Key Spoken Points**:
  > *"Our executive dashboard gives finance teams instant clarity. We processed 4,000 transactions, matching 96.94% under Ground Truth mode, isolating 746 exceptions representing ₹2.2M at risk.*
  >
  > *To filter clean matches from anomalies, we compared standard rules against Logistic Regression, CatBoost, and TabPFN. On our **Model Benchmarks** tab, we see that while both CatBoost and TabPFN hit perfect F1-scores, TabPFN requires over 9 seconds for inference. Thus, we serialized and deployed CatBoost for sub-millisecond production latency, using TabPFN as a validation baseline."*

---

### 3. The "Wow" Moment: Live Demo Tab (1:30 - 3:00 | 90s)
* **Visuals**: Switch to the **Live Demo** tab. 
  1. **Clean Test**: Leave default values (success status, 1-day delay, 0% residuals) and click "Run Reconciliation Check". Focus on the green `AUTO APPROVE` card showing 99.95% confidence.
  2. **Anomalous Test**: Change status dropdown to `partial_refund`. Click "Run Reconciliation Check". Highlight the yellow `FLAG FOR REVIEW` card showing the warning and the live Claude explanation.
* **Key Spoken Points**:
  > *"Let's test the system live. Under the Live Demo tab, we'll feed a transaction representing a clean settlement delay. Running the check triggers the pre-serialized CatBoost model on port 8000, returning a green **Auto-Approve** decision in milliseconds.*
  >
  > *Now, let's inject a mismatch—status changed to 'partial_refund'. We run the check again. The model flags this transaction with 98% anomaly probability, calculates its severity, and calls Claude live to explain: 'Partial refund transaction of ₹5,000.00 INR requires manual verification of split ledger entries.' Action is instantly updated to **Flag for Review**. This is a live REST API call running our production wrapper."*

---

### 4. Failure Recovery & Honesty Log (3:00 - 4:00 | 60s)
* **Visuals**: Switch to the **Hard Mode Diagnostics** tab. Scroll down to show the **Documented Finding: The 2026-08-19 Settlement Collision** panel.
* **Key Spoken Points**:
  > *"A great build is defined by how it handles real-world failure. At scale, our subset-sum decomposition collapsed from 96% to only 2% matches. We recovered by replacing standard combinatorial search with an optimized **Meet-in-the-Middle (MITM) exact solver**, boosting matching to 2,207 transactions.*
  >
  > *However, we encountered an unsolved boundary collision on August 19, 2026. Because our matcher runs sequentially, a batch settled concurrently 'stole' valid components from another batch, leaving subsequent batches unmatched. We honestly report this diagnostics collision on the dashboard. In production, this can be solved using a global **Integer Linear Programming (ILP) Solver**.*
  >
  > *Additionally, we caught Claude recommending 'auto_approve' for high-value anomalies. We resolved this by implementing **post-processing safety overrides**—automatically correcting high-severity actions to 'flag_for_review'."*

---

### 5. Closing & Future Vision (4:00 - 4:30 | 30s)
* **Visuals**: Open the Swagger UI page at `http://localhost:8000/docs` to show the REST endpoints. Scroll down the endpoints.
* **Key Spoken Points**:
  > *"Recon AI bridges the gap between raw fintech logs and the ledger. By wrapping the pipeline in a FastAPI backend with auto-generated Swagger docs, this functions as an enterprise-grade microservice.*
  >
  > *We close the loop on finance operations by turning complex matching math into trusted, explainable, and automated decisions. Thank you!"*
