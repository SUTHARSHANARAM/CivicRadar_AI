from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import reports, realtime
from database import engine, Base, SessionLocal
from models.report import Report
from sqlalchemy import inspect, text

# Create Tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite missing columns
with engine.connect() as conn:
    inspector = inspect(engine)
    if "reports" in inspector.get_table_names():
        existing_cols = [c["name"] for c in inspector.get_columns("reports")]
        if "department" not in existing_cols:
            conn.execute(text("ALTER TABLE reports ADD COLUMN department VARCHAR DEFAULT 'General Municipal Works'"))
        if "upvotes" not in existing_cols:
            conn.execute(text("ALTER TABLE reports ADD COLUMN upvotes INTEGER DEFAULT 0"))
        if "resolution_image_url" not in existing_cols:
            conn.execute(text("ALTER TABLE reports ADD COLUMN resolution_image_url VARCHAR"))
        if "resolution_notes" not in existing_cols:
            conn.execute(text("ALTER TABLE reports ADD COLUMN resolution_notes TEXT"))
        if "resolved_at" not in existing_cols:
            conn.execute(text("ALTER TABLE reports ADD COLUMN resolved_at DATETIME"))
        conn.commit()

# Seed initial sample data if database is empty (for live cloud deployment demo)
db = SessionLocal()
try:
    if db.query(Report).count() == 0:
        sample_reports = [
            Report(
                title="Deep Pothole near Main Market",
                description="Large dangerous pothole on the main road causing severe traffic slowdowns and vehicle damage.",
                type="Pothole",
                department="PWD / Roads Department",
                latitude=28.6139,
                longitude=77.2090,
                urgency_level="High",
                status="Reported",
                upvotes=12
            ),
            Report(
                title="Broken Streetlight at Block B",
                description="Streetlight flickering and completely dark at night creating unsafe conditions for pedestrians.",
                type="Streetlight",
                department="Electricity & Lighting Board",
                latitude=28.6145,
                longitude=77.2095,
                urgency_level="Medium",
                status="Reported",
                upvotes=5
            ),
            Report(
                title="Garbage Overflow near Bus Stop",
                description="Uncollected municipal waste dumping area spilling onto sidewalk causing foul odor and health risk.",
                type="Garbage",
                department="Sanitation & Waste Management",
                latitude=28.6150,
                longitude=77.2100,
                urgency_level="High",
                status="Reported",
                upvotes=8
            ),
            Report(
                title="Main Water Pipeline Burst",
                description="High pressure clean water leaking heavily onto road near residential junction.",
                type="Water Leak",
                department="Water Supply & Sewerage Board",
                latitude=28.6130,
                longitude=77.2080,
                urgency_level="High",
                status="Reported",
                upvotes=15
            ),
            Report(
                title="Traffic Signal Red Light Stuck",
                description="Traffic signal stuck on red causing confusion and bottleneck at 4-way intersection.",
                type="Traffic Signal",
                department="Traffic & Transit Authority",
                latitude=28.6125,
                longitude=77.2075,
                urgency_level="High",
                status="Reported",
                upvotes=9
            ),
        ]
        db.add_all(sample_reports)
        db.commit()
finally:
    db.close()

app = FastAPI(
    title="City Problem Radar API",
    description="Backend for Citizen Reporting & Smart City Management",
    version="1.0.0"
)

origins = ["*"]  # Allow all origins for production cloud deployment

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(realtime.router, tags=["Realtime"])

@app.get("/")
def read_root():
    return {"message": "City Problem Radar API is Live 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
