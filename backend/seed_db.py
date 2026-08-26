import os
import sys
import pandas as pd
import numpy as np

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import get_collection

def seed_collection_from_csv(csv_path, collection_name, is_bank=False):
    """Drops existing collection and inserts all cleaned CSV rows as MongoDB documents."""
    if not os.path.exists(csv_path):
        print(f"Skipping {collection_name}: CSV file not found at {csv_path}")
        return
        
    # Read and clean NaNs for JSON compatibility
    df = pd.read_csv(csv_path)
    df = df.replace({np.nan: None})
    
    records = df.to_dict(orient="records")
    
    # Special BSON array format for bank settlements
    if is_bank:
        for r in records:
            if r.get('component_txn_ids'):
                r['component_txn_ids'] = [
                    x.strip() for x in str(r['component_txn_ids']).split(';') if x.strip()
                ]
            else:
                r['component_txn_ids'] = []
                
    col = get_collection(collection_name)
    col.delete_many({}) # Clear existing documents for idempotency
    
    if records:
        col.insert_many(records)
        print(f"Seeded collection '{collection_name}' with {len(records)} documents from {os.path.basename(csv_path)}")
    else:
        print(f"Collection '{collection_name}' created (empty)")

def main():
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    datadir = os.path.join(ROOT_DIR, "data")
    
    print("Starting database seeding from local CSV files...")
    
    seed_collection_from_csv(os.path.join(datadir, "gateway.csv"), "gateway_transactions")
    seed_collection_from_csv(os.path.join(datadir, "bank.csv"), "bank_settlements", is_bank=True)
    seed_collection_from_csv(os.path.join(datadir, "ledger.csv"), "ledger_entries")
    seed_collection_from_csv(os.path.join(datadir, "matched_pairs.csv"), "matched_pairs")
    seed_collection_from_csv(os.path.join(datadir, "exception_queue.csv"), "exceptions")
    seed_collection_from_csv(os.path.join(datadir, "benchmark_results.csv"), "benchmark_results")
    seed_collection_from_csv(os.path.join(datadir, "hard_mode_diagnostics.csv"), "hard_mode_diagnostics")
    
    print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    main()
