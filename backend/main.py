from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import reports, realtime
from database import engine, Base
from sqlalchemy import inspect, text

# Create Tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite missing columns if table already exists
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

app = FastAPI(
    title="City Problem Radar API",
    description="Backend for Citizen Reporting & Smart City Management",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

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
