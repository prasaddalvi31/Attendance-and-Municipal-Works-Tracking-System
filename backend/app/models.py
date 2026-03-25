from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from geoalchemy2 import Geometry
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    role = Column(String) # 'worker' or 'admin'

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    # PostGIS Geometry column for GPS coordinates
    location = Column(Geometry('POINT')) 
    photo_url = Column(String, nullable=True)
    anomaly_flag = Column(Integer, default=0) # 0 = normal, 1 = flagged by ML

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float)
    lng = Column(Float)
    photo_url = Column(String, nullable=True)
    estimated_workers = Column(Integer)
    status = Column(String, default="pending") # "pending" or "completed"
    completed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)