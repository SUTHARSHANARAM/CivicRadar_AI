from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Docker Compose: db service maps 5432->5432.
# User: admin, Pass: password, DB: city_radar
# SQLALCHEMY_DATABASE_URL = "postgresql://admin:password@localhost/city_radar"
SQLALCHEMY_DATABASE_URL = "sqlite:///./city_radar.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
