import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")

if not uri:
    print("MONGODB_URI not found")
    raise SystemExit

client = MongoClient(uri)

try:
    client.admin.command("ping")
    print("MongoDB Atlas connection: SUCCESS")
except Exception as e:
    print("MongoDB Atlas connection: FAILED")
    print(e)
finally:
    client.close()