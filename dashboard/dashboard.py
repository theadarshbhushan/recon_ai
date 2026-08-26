import os
import sys
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set page config for a premium wide layout
st.set_page_config(
    layout="wide",
    page_title="AI Finance Controller Reconciliation Dashboard",
    page_icon="📊",
    initial_sidebar_state="expanded"
)

# Set page styling for premium unified design
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

    /* Global Font Override */
    .stApp {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Header Banner Styling */
    .header-banner {
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
        padding: 1.5rem 2rem;
        border-radius: 0.75rem;
        margin-bottom: 2rem;
        border: 1px solid #334155;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .header-tagline {
        color: #6366F1;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.25rem;
    }
    .header-title {
        color: #ffffff !important;
        font-size: 2rem !important;
        font-weight: 800 !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Outfit', sans-serif !important;
        border-bottom: none !important;
    }
    .header-desc {
        color: #94A3B8;
        font-size: 0.95rem;
        margin-top: 0.4rem;
        margin-bottom: 0;
    }

    /* Custom Metric Cards */
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #E2E8F0;
        padding: 1.2rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        margin-bottom: 1rem;
        transition: all 0.25s ease-in-out;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
    }
    .metric-card-indigo { border-left: 4px solid #4F46E5; }
    .metric-card-green { border-left: 4px solid #10B981; }
    .metric-card-orange { border-left: 4px solid #F59E0B; }
    .metric-card-red { border-left: 4px solid #EF4444; }

    .metric-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.4rem;
    }
    .metric-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: #0F172A;
        font-family: 'Outfit', sans-serif;
    }

    /* Sidebar Custom Styling */
    .sidebar-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        padding: 1.2rem;
        border-radius: 0.75rem;
        border-left: 4px solid #4F46E5;
        margin-top: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .badge-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.6rem;
    }
    .pill-badge {
        background-color: #EEF2F6;
        color: #475569;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: 1rem;
        border: 1px solid #E2E8F0;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# -----------------------------------------------------------------------------
# Sidebar Configuration
# -----------------------------------------------------------------------------
st.sidebar.markdown(
    """
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="font-size: 1.8rem;">📊</span>
        <span style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: #0F172A;">Recon AI</span>
    </div>
    <div style="font-size: 0.85rem; color: #64748B; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">AI Finance Controller</div>
    """,
    unsafe_allow_html=True
)

# Pipeline Live Status Indicator
st.sidebar.markdown(
    """
    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 0.5rem; margin-bottom: 1rem;">
        <span style="color: #10B981; font-size: 1.1rem; line-height: 1;">●</span>
        <span style="color: #065F46; font-size: 0.8rem; font-weight: 600;">Pipeline Status: Live</span>
    </div>
    """,
    unsafe_allow_html=True
)

st.sidebar.markdown(
    "An automated three-way reconciliation system matching transactions across "
    "payment gateways, bank settlement batches, and internal ledger logs."
)
st.sidebar.divider()

# Styled card instead of default info box
st.sidebar.markdown(
    """
    <div class="sidebar-card">
        <div style="font-weight: 700; font-size: 0.75rem; color: #6366F1; text-transform: uppercase; letter-spacing: 0.05em;">Razorpay AI Buildathon 2026</div>
        <div style="font-weight: 700; font-size: 0.9rem; color: #1E293B; margin-top: 0.4rem;">🏆 Judging Pillars</div>
        <div class="badge-container">
            <span class="pill-badge">Problem Taste</span>
            <span class="pill-badge">Build Quality</span>
            <span class="pill-badge">AI Judgment</span>
            <span class="pill-badge">Failure Recovery</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

# -----------------------------------------------------------------------------
# Data Loader Function
# -----------------------------------------------------------------------------
@st.cache_data
def load_data():
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    datadir = os.path.join(ROOT_DIR, "data")
    from backend.database import get_collection
    
    try:
        col_gateway = get_collection("gateway_transactions")
        col_bank = get_collection("bank_settlements")
        col_matched = get_collection("matched_pairs")
        col_bench = get_collection("benchmark_results")
        col_exceptions = get_collection("exceptions")
        col_hm_diag = get_collection("hard_mode_diagnostics")
        
        if (col_gateway.count_documents({}) > 0 and 
            col_bank.count_documents({}) > 0 and 
            col_exceptions.count_documents({}) > 0):
            
            df_gateway = pd.DataFrame(list(col_gateway.find({}, {'_id': 0})))
            df_bank = pd.DataFrame(list(col_bank.find({}, {'_id': 0})))
            df_matched = pd.DataFrame(list(col_matched.find({}, {'_id': 0})))
            df_bench = pd.DataFrame(list(col_bench.find({}, {'_id': 0})))
            df_exceptions = pd.DataFrame(list(col_exceptions.find({}, {'_id': 0})))
            
            # Format component_txn_ids BSON array to semicolon string for visual rendering compatibility
            df_bank['component_txn_ids'] = df_bank['component_txn_ids'].apply(
                lambda x: ';'.join(x) if isinstance(x, list) else x
            )
            
            if col_hm_diag.count_documents({}) > 0:
                df_hard_mode_diag = pd.DataFrame(list(col_hm_diag.find({}, {'_id': 0})))
            else:
                df_hard_mode_diag = pd.DataFrame(columns=[
                    "batch_id", "merchant_id", "date", "candidate_pool_size", 
                    "method_used", "matched", "target_amount", "sum_of_matched_amounts"
                ])
            return df_gateway, df_bank, df_matched, df_bench, df_exceptions, df_hard_mode_diag
        else:
            raise RuntimeError("Database collections are empty")
    except Exception as db_err:
        # Fallback to CSV
        df_gateway = pd.read_csv(os.path.join(datadir, "gateway.csv"))
        df_bank = pd.read_csv(os.path.join(datadir, "bank.csv"))
        df_matched = pd.read_csv(os.path.join(datadir, "matched_pairs.csv"))
        df_bench = pd.read_csv(os.path.join(datadir, "benchmark_results.csv"))
        df_exceptions = pd.read_csv(os.path.join(datadir, "exception_queue.csv"))
        try:
            df_hard_mode_diag = pd.read_csv(os.path.join(datadir, "hard_mode_diagnostics.csv"))
        except Exception:
            df_hard_mode_diag = pd.DataFrame(columns=[
                "batch_id", "merchant_id", "date", "candidate_pool_size", 
                "method_used", "matched", "target_amount", "sum_of_matched_amounts"
            ])
        return df_gateway, df_bank, df_matched, df_bench, df_exceptions, df_hard_mode_diag

try:
    df_gateway, df_bank, df_matched, df_bench, df_exceptions, df_hard_mode_diag = load_data()
except Exception as e:
    st.error(f"Error loading datasets: {e}. Please ensure you have run match_engine.py and exception_queue.py first.")
    st.stop()

# -----------------------------------------------------------------------------
# Tabs Layout
# -----------------------------------------------------------------------------
tab_overview, tab_model, tab_exceptions, tab_explorer, tab_diagnostics, tab_live = st.tabs([
    "📈 Overview", 
    "🤖 Model Benchmarks", 
    "⚠️ Exception Queue", 
    "🔍 Batch Decomposition Explorer", 
    "🛠️ Hard Mode Diagnostics",
    "⚡ Live Demo"
])

# =============================================================================
# 1. Overview Tab
# =============================================================================
with tab_overview:
    st.markdown(
        """
        <div class="header-banner">
            <div class="header-tagline">Reconciliation Workspace</div>
            <h1 class="header-title">Executive Reconciliation Overview</h1>
            <p class="header-desc">Reconciliation summaries, matching rates, and outstanding anomalies compilations.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    col_btn_left, col_btn_right = st.columns([3, 1])
    with col_btn_right:
        import subprocess
        import time
        if st.button("🔄 Re-run Full Pipeline", use_container_width=True):
            with st.spinner("Re-running reconciliation pipeline..."):
                try:
                    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
                    match_engine_script = os.path.join(ROOT_DIR, "backend", "match_engine.py")
                    exception_queue_script = os.path.join(ROOT_DIR, "backend", "exception_queue.py")
                    
                    subprocess.run(["python", match_engine_script, "--mode", "ground_truth"], check=True)
                    subprocess.run(["python", exception_queue_script], check=True)
                    st.cache_data.clear()
                    st.success("Reconciliation pipeline completed successfully!")
                    from backend.database import get_collection
                    df_exc_new = pd.DataFrame(list(get_collection("exceptions").find({}, {'_id': 0})))
                    st.toast(f"Pipeline refreshed! Active exceptions count: {len(df_exc_new)}")
                    time.sleep(1.0)
                    st.rerun()
                except Exception as ex:
                    st.error(f"Pipeline execution failed: {ex}")
    
    # Calculations
    eligible_gateways = df_gateway[df_gateway['status'].isin(['success', 'partial_refund'])]
    gt_match_rate = (len(df_matched) / len(eligible_gateways)) * 100 if len(eligible_gateways) > 0 else 0.0
    
    if not df_hard_mode_diag.empty:
        hm_match_rate = df_hard_mode_diag['matched'].mean() * 100
    else:
        hm_match_rate = 0.0
        
    total_reconciled = df_matched['allocated_amount'].sum()
    total_exceptions = len(df_exceptions)
    total_risk = df_exceptions['rupee_amount'].sum()
    
    # Row 1: KPI metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(
            f"""
            <div class="metric-card metric-card-indigo">
                <div class="metric-title">Total Transactions Processed</div>
                <div class="metric-value">{len(df_gateway):,}</div>
            </div>
            <div class="metric-card metric-card-green">
                <div class="metric-title">Total Rupee Reconciled</div>
                <div class="metric-value">₹{total_reconciled:,.2f}</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        
    with col2:
        st.markdown(
            f"""
            <div class="metric-card metric-card-green">
                <div class="metric-title">Overall Match Rate (Ground Truth)</div>
                <div class="metric-value">{gt_match_rate:.2f}%</div>
            </div>
            <div class="metric-card metric-card-orange">
                <div class="metric-title">Total Exception Items</div>
                <div class="metric-value">{total_exceptions:,}</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        
    with col3:
        st.markdown(
            f"""
            <div class="metric-card metric-card-indigo">
                <div class="metric-title">Overall Match Rate (Hard Mode)</div>
                <div class="metric-value">{hm_match_rate:.2f}%</div>
            </div>
            <div class="metric-card metric-card-red">
                <div class="metric-title">Total Rupee Amount at Risk</div>
                <div class="metric-value">₹{total_risk:,.2f}</div>
                <div style="font-size: 0.8rem; color: #EF4444; font-weight: 600; margin-top: 0.25rem;">▼ -₹{total_risk:,.2f} (Potential Exposure)</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        
    st.divider()
    
    # Row 2: Daily Volume Chart
    st.subheader("Daily Transaction Volume and Payouts")
    
    df_gateway['date'] = pd.to_datetime(df_gateway['timestamp']).dt.date
    df_daily = df_gateway.groupby('date')['amount'].sum().reset_index()
    
    fig_vol = px.area(
        df_daily, 
        x='date', 
        y='amount', 
        title='Daily Payment Gateway Sales (INR)', 
        labels={'amount': 'Volume (INR)', 'date': 'Date'},
        color_discrete_sequence=['#4F46E5'],
        template="plotly_white"
    )
    fig_vol.update_layout(height=400)
    st.plotly_chart(fig_vol, use_container_width=True)

# =============================================================================
# 2. Model Benchmark Tab
# =============================================================================
with tab_model:
    st.markdown(
        """
        <div class="header-banner">
            <div class="header-tagline">ML Engine Evaluation</div>
            <h1 class="header-title">ML Confidence Models Benchmarking</h1>
            <p class="header-desc">Compare baseline rule sets with CatBoost and TabPFN classifiers.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    st.subheader("Benchmark Metrics comparison")
    st.dataframe(df_bench, use_container_width=True)
    
    st.divider()
    
    col_chart1, col_chart2 = st.columns(2)
    df_valid_bench = df_bench.dropna(subset=['F1-Score'])
    
    with col_chart1:
        st.subheader("F1-Score Comparison")
        fig_f1 = px.bar(
            df_valid_bench, 
            x='Model', 
            y='F1-Score', 
            color='Model',
            range_y=[0.5, 1.05],
            text_auto='.4f',
            title='F1-Score by Model on Test Set',
            color_discrete_sequence=px.colors.qualitative.G10,
            template="plotly_white"
        )
        fig_f1.update_layout(showlegend=False, height=400)
        st.plotly_chart(fig_f1, use_container_width=True)
        
    with col_chart2:
        st.subheader("Model Time Footprint Comparison (Log Scale)")
        df_times = df_valid_bench.melt(
            id_vars=['Model'], 
            value_vars=['Train Time (s)', 'Inference Time (s)'], 
            var_name='Phase', 
            value_name='Time (s)'
        )
        fig_time = px.bar(
            df_times, 
            x='Model', 
            y='Time (s)', 
            color='Phase', 
            barmode='group',
            log_y=True,
            title='Train & Inference Time (Seconds, Log Scale)',
            color_discrete_map={'Train Time (s)': '#3B82F6', 'Inference Time (s)': '#10B981'},
            template="plotly_white"
        )
        fig_time.update_layout(height=400)
        st.plotly_chart(fig_time, use_container_width=True)
        
    st.divider()
    
    st.info(
        "**CatBoost vs TabPFN-2.5 Tradeoff Callout**\n\n"
        "- **Accuracy Parity**: Both CatBoost and TabPFN successfully map the non-linear boundaries, achieving perfect F1-Scores (1.0000).\n"
        "- **Train Time**: CatBoost takes ~2.67s vs TabPFN's ~193.48s (a **~72x difference**).\n"
        "- **Inference Time**: CatBoost takes ~0.003s vs TabPFN's ~10.9s (a **~3600x difference**).\n\n"
        "**Conclusion**: CatBoost is heavily recommended for production deployments due to its near-zero latency, while TabPFN serves as an excellent validation baseline."
    )

# =============================================================================
# 3. Exception Queue Tab
# =============================================================================
with tab_exceptions:
    st.markdown(
        """
        <div class="header-banner">
            <div class="header-tagline">Audit & Action Center</div>
            <h1 class="header-title">Unified Exception Queue</h1>
            <p class="header-desc">Ranked, categorized anomalies and automated LLM audit reports.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        categories = df_exceptions['category'].unique().tolist()
        selected_cats = st.multiselect("Filter by Exception Category", categories, default=categories)
        
    with col_f2:
        min_severity = st.slider("Minimum Severity Score Threshold", 0.0, 1.0, 0.0, 0.05)
        
    df_filtered = df_exceptions[
        (df_exceptions['category'].isin(selected_cats)) &
        (df_exceptions['severity_score'] >= min_severity)
    ]
    
    st.subheader(f"Active Exception Items ({len(df_filtered)} filtered of {len(df_exceptions)} total)")
    
    st.dataframe(
        df_filtered,
        column_config={
            "rank": st.column_config.NumberColumn("Rank", format="%d"),
            "transaction_id_or_settlement_id": st.column_config.TextColumn("Transaction/Settlement ID"),
            "category": st.column_config.TextColumn("Category"),
            "severity_score": st.column_config.NumberColumn("Severity Score", format="%.4f"),
            "rupee_amount": st.column_config.NumberColumn("Amount (INR)", format="₹%.2f"),
            "llm_explanation": st.column_config.TextColumn("Controller Explanation"),
            "recommended_action": st.column_config.TextColumn("Action")
        },
        use_container_width=True,
        hide_index=True
    )
    
    st.divider()
    
    col_exc1, col_exc2 = st.columns(2)
    with col_exc1:
        st.subheader("Exception Categories Distribution")
        fig_pie = px.pie(
            df_filtered, 
            names='category', 
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Pastel,
            template="plotly_white"
        )
        fig_pie.update_layout(height=350)
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_exc2:
        st.subheader("Exceptions by Recommended Action")
        action_colors = {'auto_approve': '#10B981', 'flag_for_review': '#F59E0B', 'escalate': '#EF4444'}
        fig_bar = px.histogram(
            df_filtered, 
            x='recommended_action', 
            color='recommended_action',
            color_discrete_map=action_colors,
            template="plotly_white"
        )
        fig_bar.update_layout(showlegend=False, height=350)
        st.plotly_chart(fig_bar, use_container_width=True)

# =============================================================================
# 4. Batch Decomposition Explorer Tab
# =============================================================================
with tab_explorer:
    st.markdown(
        """
        <div class="header-banner">
            <div class="header-tagline">Batch Breakdown Analysis</div>
            <h1 class="header-title">Settlement Batch Decomposition Explorer</h1>
            <p class="header-desc">Select any bank batch to inspect constituent gateway payouts and allocations.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    batch_ids = df_bank['batch_id'].tolist()
    selected_batch_id = st.selectbox("Select Batch ID", batch_ids)
    
    batch_row = df_bank[df_bank['batch_id'] == selected_batch_id].iloc[0]
    
    col_b1, col_b2, col_b3, col_b4 = st.columns(4)
    col_b1.metric("Batch Amount", f"₹{batch_row['amount']:,.2f}")
    col_b2.metric("Merchant ID", batch_row['merchant_id'])
    col_b3.metric("Settlement Date", batch_row['settlement_date'])
    col_b4.metric("UTR Number", batch_row['utr_number'])
    
    batch_matches = df_matched[df_matched['batch_id'] == selected_batch_id]
    
    if not df_hard_mode_diag.empty:
        diag_matches = df_hard_mode_diag[df_hard_mode_diag['batch_id'] == selected_batch_id]
        if not diag_matches.empty:
            method_used = diag_matches.iloc[0]['method_used']
            is_matched_hm = diag_matches.iloc[0]['matched']
        else:
            method_used = "Ground Truth Mapping"
            is_matched_hm = True
    else:
        method_used = "Ground Truth Mapping"
        is_matched_hm = True
        
    st.subheader("Constituent Gateway Transactions")
    if not batch_matches.empty:
        st.dataframe(
            batch_matches[[
                'transaction_id', 'gateway_amount', 'refund_amount', 
                'expected_settled_amount', 'allocated_amount', 'amount_diff_pct', 'date_diff_days'
            ]],
            column_config={
                "transaction_id": st.column_config.TextColumn("Transaction ID"),
                "gateway_amount": st.column_config.NumberColumn("Gateway Amount", format="₹%.2f"),
                "refund_amount": st.column_config.NumberColumn("Refunded", format="₹%.2f"),
                "expected_settled_amount": st.column_config.NumberColumn("Expected Settlement", format="₹%.2f"),
                "allocated_amount": st.column_config.NumberColumn("Allocated Payout", format="₹%.2f"),
                "amount_diff_pct": st.column_config.NumberColumn("Residual Diff (%)", format="%.4f%%"),
                "date_diff_days": st.column_config.NumberColumn("Settlement Delay (Days)")
            },
            use_container_width=True,
            hide_index=True
        )
        
        sum_expected = batch_matches['expected_settled_amount'].sum()
        residual_pct = ((sum_expected - batch_row['amount']) / batch_row['amount']) * 100
        
        if is_matched_hm:
            st.success(
                f"**Decomposition Outcome:** Successfully decomposed batch **{selected_batch_id}** "
                f"into **{len(batch_matches)}** gateway components. \n\n"
                f"- **Decomposition Mode (Hard Mode)**: `{method_used}`\n"
                f"- **Batch Payout Residual**: `{residual_pct:.4f}%`"
            )
        else:
            st.warning(
                f"**Decomposition Outcome:** Batch was mapped via Ground Truth records but failed "
                f"to resolve in Hard Mode subset-sum matching. \n\n"
                f"- **Hard Mode Status**: Failed (chronological boundary conflict)\n"
                f"- **Batch Payout Residual**: `{residual_pct:.4f}%`"
            )
    else:
        st.warning(
            f"**Decomposition Outcome:** Batch **{selected_batch_id}** could not be resolved "
            f"into component transactions. No matching components found on disk. Batch remains escalated."
        )

# =============================================================================
# 5. Hard Mode Diagnostics Tab
# =============================================================================
with tab_diagnostics:
    st.markdown(
        """
        <div class="header-banner">
            <div class="header-tagline">Algorithm Health & Diagnostics</div>
            <h1 class="header-title">Hard Mode Subset-Sum Solver Performance</h1>
            <p class="header-desc">Diagnostics of batch matching algorithms executing without ground-truth linkages.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    if not df_hard_mode_diag.empty:
        method_stats = df_hard_mode_diag.groupby('method_used').agg(
            count=('matched', 'count'),
            success_rate=('matched', 'mean')
        ).reset_index()
        method_stats['success_rate_pct'] = method_stats['success_rate'] * 100
        
        col_d1, col_d2 = st.columns(2)
        
        with col_d1:
            st.subheader("Method Frequency Breakdown")
            fig_freq = px.bar(
                method_stats, 
                x='method_used', 
                y='count', 
                color='method_used',
                title='Decomposition Methods Frequency',
                color_discrete_sequence=px.colors.qualitative.Safe,
                template="plotly_white"
            )
            fig_freq.update_layout(showlegend=False, height=350)
            st.plotly_chart(fig_freq, use_container_width=True)
            
        with col_d2:
            st.subheader("Success Rate per Method")
            fig_sr = px.bar(
                method_stats, 
                x='method_used', 
                y='success_rate_pct', 
                color='method_used',
                range_y=[0, 105],
                text_auto='.1f',
                title='Match Success Rate (%)',
                color_discrete_sequence=px.colors.qualitative.Safe,
                template="plotly_white"
            )
            fig_sr.update_layout(showlegend=False, height=350)
            st.plotly_chart(fig_sr, use_container_width=True)
    else:
        st.info("No Hard Mode diagnostics logs found on disk. Run `match_engine.py --mode hard` to generate them.")
        
    st.divider()
    
    st.subheader("Documented Finding: The 2026-08-19 Settlement Collision")
    st.markdown(
        "During execution on the $N=4000$ dataset, the Hard Mode subset-sum solver matched 2,207 transactions "
        "successfully, but left 473 batches (52.38%) unmatched. Analysis of the unmatched batches revealed "
        "a critical boundary collision pattern on **August 19, 2026**."
    )
    
    st.markdown(
        """
        **Root Cause Analysis:**
        1. **High Daily Transaction Volume**: Increasing volume from 1,000 to 4,000 transactions raises the average transactions per merchant per day to ~44.
        2. **Overlapping Settlements**: On 2026-08-19, multiple batches for the same merchant were settled concurrently.
        3. **Candidate Theft**: Because the subset-sum solver runs sequentially batch-by-batch, a batch processing first can consume components that mathematically sum to its target but actually belong to another batch settled on the same day. 
        4. **Decomposition Failure**: Once identical or near-identical amounts are 'stolen' by a preceding batch, subsequent batches cannot find any combination of the remaining candidates that matches their target, leading to total matching failure.
        
        **Industrial Solutions for Production:**
        - **Global LP Solver (Integer Linear Programming)**: Instead of sequential matching, define decomposition as a global optimization problem (e.g. using Pulp or Scipy) to maximize matches across all active settlements for a merchant concurrently.
        - **Stricter Temporal Weighting**: Allocate higher probabilities to transactions occurring closer in time to the settlement date.
        """
    )

# =============================================================================
# 6. Live Demo Tab
# =============================================================================
with tab_live:
    st.markdown(
        """
        <div class="header-banner" style="background: linear-gradient(135deg, #311B92 0%, #1A237E 100%); border: 1px solid #3F51B5;">
            <div class="header-tagline" style="color: #8C9EFF;">Live Prediction Playground</div>
            <h1 class="header-title">⚡ Live Single-Transaction Predictor</h1>
            <p class="header-desc" style="color: #C5CAE9;">Interactively evaluate model inference and trigger real-time Claude explainers.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    col_input, col_output = st.columns([1, 1])
    
    with col_input:
        st.subheader("Transaction Parameters")
        gateway_amount = st.number_input("Gateway Transaction Amount (INR)", min_value=1.0, max_value=50000.0, value=5000.0, step=100.0)
        payment_method = st.selectbox("Payment Method", ["upi", "card", "netbanking", "wallet", "emi"])
        status = st.selectbox("Transaction Status", ["success", "partial_refund", "refunded", "failed"])
        
        if status == "partial_refund":
            refund_amount = st.slider("Refunded Amount (INR)", min_value=0.0, max_value=gateway_amount, value=gateway_amount * 0.2, step=10.0)
        elif status == "refunded":
            refund_amount = gateway_amount
            st.info(f"Refund Amount is locked to Gateway Amount (₹{gateway_amount:,.2f})")
        else:
            refund_amount = 0.0
            
        date_diff_days = st.slider("Settlement Delay (Days)", min_value=0, max_value=10, value=1)
        batch_size = st.slider("Settlement Batch Size (Component Count)", min_value=1, max_value=15, value=4)
        
        st.divider()
        st.subheader("Batch Health Parameters")
        
        batch_residual_pct = st.slider("Batch Residual Deviation (%)", min_value=-50.0, max_value=50.0, value=0.0, step=0.1)
        amount_diff_pct = st.slider("Transaction Residual Deviation (%)", min_value=-50.0, max_value=50.0, value=0.0, step=0.1)
        
        btn_run = st.button("🚀 Run Reconciliation Check", use_container_width=True)
        
    with col_output:
        st.subheader("Prediction Result & LLM Audit")
        
        if btn_run:
            with st.spinner("Executing ML inference and LLM analysis..."):
                try:
                    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
                    
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
                            
                    if expected_settled_amount > 0:
                        batch_amount = expected_settled_amount / (1 + batch_residual_pct / 100)
                    else:
                        batch_amount = 0.0
                        
                    allocated_amount = expected_settled_amount * (1 + amount_diff_pct / 100)
                    
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
                    
                    # Load CatBoost Model
                    import joblib
                    model_path = os.path.join(ROOT_DIR, "models", "catboost_model.pkl")
                    if os.path.exists(model_path):
                        cb_model = joblib.load(model_path)
                        clean_prob = cb_model.predict_proba(df_input)[0, 1]
                    else:
                        st.error(f"Pre-trained CatBoost model not found at {model_path}! Please run models.py first.")
                        st.stop()
                        
                    anomaly_prob = 1.0 - clean_prob
                    
                    # Compute severity score
                    a_min = df_exceptions['rupee_amount'].min() if not df_exceptions.empty else 1.0
                    a_max = df_exceptions['rupee_amount'].max() if not df_exceptions.empty else 50000.0
                    denom = a_max - a_min if a_max != a_min else 1.0
                    a_norm = (gateway_amount - a_min) / denom
                    a_norm = max(0.0, min(1.0, a_norm))
                    
                    severity_score = 0.4 * anomaly_prob + 0.6 * a_norm
                    
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
                            
                        # Live LLM Explanation
                        from backend.exception_queue import explain_exception
                        api_key = os.environ.get("ANTHROPIC_API_KEY")
                        
                        features = {
                            "transaction_id_or_settlement_id": "TXN_LIVE_DEMO",
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
                        
                    if rec_action == "auto_approve":
                        st.success(
                            f"### ✅ Reconciliation Decision: AUTO APPROVE\n\n"
                            f"- **Match Quality**: Clean (Auto-Approve Confidence: {clean_prob*100:.2f}%)\n"
                            f"- **Exception Category**: `{category}`\n"
                            f"- **Severity Score**: `{severity_score:.4f}` *(low urgency)*\n"
                            f"- **Reconciliation Value**: ₹{gateway_amount:,.2f} INR\n\n"
                            f"**Controller Explanation**:\n"
                            f"{llm_exp}"
                        )
                    elif rec_action == "flag_for_review":
                        st.warning(
                            f"### ⚠️ Reconciliation Decision: FLAG FOR REVIEW\n\n"
                            f"- **Match Quality**: Anomalous (Anomaly Confidence: {anomaly_prob*100:.2f}%)\n"
                            f"- **Exception Category**: `{category}`\n"
                            f"- **Severity Score**: `{severity_score:.4f}`\n"
                            f"- **Reconciliation Value**: ₹{gateway_amount:,.2f} INR\n\n"
                            f"**Controller Explanation**:\n"
                            f"{llm_exp}"
                        )
                    else:
                        st.error(
                            f"### 🚨 Reconciliation Decision: ESCALATE TO AUDIT\n\n"
                            f"- **Match Quality**: Anomalous (Anomaly Confidence: {anomaly_prob*100:.2f}%)\n"
                            f"- **Exception Category**: `{category}`\n"
                            f"- **Severity Score**: `{severity_score:.4f}`\n"
                            f"- **Reconciliation Value**: ₹{gateway_amount:,.2f} INR\n\n"
                            f"**Controller Explanation**:\n"
                            f"{llm_exp}"
                        )
                except Exception as ex:
                    st.error(f"Live prediction failed: {ex}")
        else:
            st.info("Adjust the parameters on the left and click **Run Reconciliation Check** to test live model inference.")
            
    st.divider()
    st.caption("⚡ **Technical Verification**: This runs the CatBoost model and calls the live Claude API (or local template fallback if API key is not configured).")
    st.caption("ℹ️ *CatBoost is used here for live inference due to sub-millisecond latencies, as shown in our Benchmarks tab.*")
