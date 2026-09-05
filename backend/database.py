import os
import pymongo
from dotenv import load_dotenv

# Load environment variables from parent directory .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Read MONGODB_URI (or MONGODB_URL) from environment; no localhost fallback
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL")
if not MONGODB_URI:
    raise RuntimeError(
        "CRITICAL: MONGODB_URI (or MONGODB_URL) is not set in environment or .env file. "
        "Please specify your MongoDB connection string in the .env file."
    )

DB_NAME = os.getenv("DB_NAME", "recon_ai")

client = None
db = None

def get_db():
    """Returns a singleton reference to the MongoDB database object."""
    global client, db
    if client is None:
        client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
    return db

def get_collection(name: str):
    """Returns a pymongo Collection reference from the DB name."""
    return get_db()[name]
