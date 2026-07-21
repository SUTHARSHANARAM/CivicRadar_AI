from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from database import get_db
from models.report import Report
from services.priority_service import priority_service
from services.hotspot_service import hotspot_service
from realtime.socket_manager import manager

router = APIRouter()

def resolve_department(category: str, title: str = "") -> str:
    cat_lower = (category or "").lower()
    title_lower = (title or "").lower()
    
    if "pothole" in cat_lower or "pothole" in title_lower or "road" in title_lower:
        return "PWD / Roads Department"
    elif "light" in cat_lower or "light" in title_lower or "strretlight" in title_lower:
        return "Electricity & Lighting Board"
    elif "garbage" in cat_lower or "garbage text" in title_lower or "waste" in cat_lower:
        return "Sanitation & Waste Management"
    elif "water" in cat_lower or "leak" in cat_lower or "sewer" in cat_lower:
        return "Water Supply & Sewerage Board"
    elif "traffic" in cat_lower or "signal" in cat_lower:
        return "Traffic & Transit Authority"
    return "General Municipal Works"

# --- Pydantic Schemas ---
class ReportCreate(BaseModel):
    title: str
    description: str
    type: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None

class ReportResponse(ReportCreate):
    id: int
    urgency_level: str
    department: str = "General Municipal Works"
    status: str
    upvotes: int = 0
    resolution_image_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    urgency_level: Optional[str] = None
    department: Optional[str] = None
    resolution_image_url: Optional[str] = None
    resolution_notes: Optional[str] = None

# --- Endpoints ---

@router.post("/reports", response_model=ReportResponse)
async def create_report(report_in: ReportCreate, db: Session = Depends(get_db)):
    ai_result = priority_service.predict(report_in.description)
    urgency = ai_result.get("urgency", "Pending")
    
    assigned_dept = resolve_department(report_in.type, report_in.title)
    
    new_report = Report(
        title=report_in.title,
        description=report_in.description,
        type=report_in.type,
        department=assigned_dept,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        image_url=report_in.image_url,
        urgency_level=urgency,
        status="Reported",
        upvotes=0
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    await manager.broadcast({
        "type": "NEW_REPORT",
        "data": {
            "id": new_report.id,
            "title": new_report.title,
            "latitude": new_report.latitude,
            "longitude": new_report.longitude,
            "urgency_level": new_report.urgency_level,
            "type": new_report.type,
            "department": new_report.department,
            "description": new_report.description,
            "status": new_report.status,
            "upvotes": new_report.upvotes,
            "image_url": new_report.image_url
        }
    })
    
    return new_report

@router.get("/reports", response_model=List[ReportResponse])
def get_reports(department: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Report)
    if department and department != "All":
        query = query.filter(Report.department == department)
    return query.order_by(Report.id.desc()).all()

@router.get("/hotspots")
def get_hotspots(db: Session = Depends(get_db)):
    all_reports = db.query(Report).all()
    zones = hotspot_service.predict_risk_zones(all_reports)
    return zones

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.status == "Reported").count()
    resolved = db.query(Report).filter(Report.status == "Resolved").count()
    high_urgency = db.query(Report).filter(Report.urgency_level == "High").count()
    
    return {
        "total": total,
        "pending": pending,
        "resolved": resolved,
        "high_urgency": high_urgency
    }

@router.put("/reports/{report_id}", response_model=ReportResponse)
async def update_report(report_id: int, update_data: ReportUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if update_data.status:
        report.status = update_data.status
        if update_data.status == "Resolved" and not report.resolved_at:
            report.resolved_at = datetime.utcnow()
            
    if update_data.urgency_level:
        report.urgency_level = update_data.urgency_level

    if update_data.department:
        report.department = update_data.department
        
    if update_data.resolution_image_url is not None:
        report.resolution_image_url = update_data.resolution_image_url
        
    if update_data.resolution_notes is not None:
        report.resolution_notes = update_data.resolution_notes
    
    db.commit()
    db.refresh(report)
    
    await manager.broadcast({
        "type": "UPDATE_REPORT",
        "data": {
            "id": report.id,
            "status": report.status,
            "urgency_level": report.urgency_level,
            "department": report.department,
            "resolution_image_url": report.resolution_image_url,
            "resolution_notes": report.resolution_notes,
            "resolved_at": report.resolved_at.isoformat() if report.resolved_at else None
        }
    })
    
    return report

@router.post("/reports/{report_id}/upvote")
async def upvote_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.upvotes = (report.upvotes or 0) + 1
    
    if report.upvotes >= 20 and report.urgency_level != "High":
        report.urgency_level = "High"
    elif report.upvotes >= 5 and report.urgency_level == "Low":
        report.urgency_level = "Medium"
        
    db.commit()
    db.refresh(report)
    
    await manager.broadcast({
        "type": "UPVOTE_REPORT",
        "data": {
            "id": report.id,
            "upvotes": report.upvotes,
            "urgency_level": report.urgency_level
        }
    })
    
    return {"id": report.id, "upvotes": report.upvotes, "urgency_level": report.urgency_level}
