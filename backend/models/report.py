from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    type = Column(String)  # Pothole, Streetlight, Garbage, Traffic Signal, Water Leak, Other
    department = Column(String, default="General Public Works")  # Assigned Municipal Dept
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    
    # AI & Engagement Fields
    urgency_level = Column(String, default="Pending") # High, Medium, Low
    upvotes = Column(Integer, default=0)
    
    # Status & Resolution Proof Fields
    status = Column(String, default="Reported") # Reported, In Progress, Resolved
    resolution_image_url = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
