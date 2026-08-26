import os
import pymongo
from dotenv import load_dotenv

# Load environment variables from parent directory .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "recon_ai"

client = None
db = None

def get_db():
    """Returns a singleton reference to the MongoDB database object."""
    global client, db
    if client is None:
        client = pymongo.MongoClient(MONGODB_URI)
        db = client[DB_NAME]
    return db

def get_collection(name: str):
    """Returns a pymongo Collection reference from the DB name."""
    return get_db()[name]
