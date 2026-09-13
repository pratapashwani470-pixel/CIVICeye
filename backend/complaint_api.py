from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pymongo import MongoClient

import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["civic_eye"]
complaints_collection = db["complaints"]


@router.post("/api/complaints")
async def create_complaint(complaint: dict):
    complaint["created_at"] = datetime.now(timezone.utc)

    result = complaints_collection.insert_one(complaint)

    return {
        "success": True,
        "complaint_id": str(result.inserted_id),
    }
@router.get("/api/complaints")
async def get_complaints():
    complaints = list(
        complaints_collection.find().sort("created_at", -1)
    )

    for complaint in complaints:
        complaint["_id"] = str(complaint["_id"])

    return complaints

@router.patch("/api/complaints/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, payload: dict):
    status = payload.get("status")

    allowed_statuses = ["Submitted", "In Progress", "Resolved"]

    if status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = complaints_collection.update_one(
        {"complaint_id": complaint_id},
        {"$set": {"status": status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return {
        "success": True,
        "complaint_id": complaint_id,
        "status": status,
    }