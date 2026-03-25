from fastapi import FastAPI, Depends, HTTPException, Form, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database, auth, ml_engine
from pydantic import BaseModel
import os
import uuid
import secrets

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="NeuraX Municipal Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists
os.makedirs("app/static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

class LocationData(BaseModel):
    lat: float
    lng: float
    worker_id: int
    password: str = None

class LoginRequest(BaseModel):
    username: str # Can act as worker ID or admin username
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/api/track")
async def track_worker_location(
    lat: float = Form(...),
    lng: float = Form(...),
    worker_id: int = Form(...),
    password: str = Form(None),
    task_id: int = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # 1. Pass data through the ML Anomaly Detection Layer
    is_suspicious = ml_engine.ml_engine.detect_anomaly(lat, lng)
    
    # 2. Format location for PostGIS (WKT format: POINT(lon lat))
    point_wkt = f"POINT({lng} {lat})"
    
    # Process image upload if exists
    photo_url = None
    if photo and photo.filename:
        ext = photo.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("app/static/uploads", unique_filename)
        with open(filepath, "wb") as f:
            f.write(await photo.read())
        photo_url = f"static/uploads/{unique_filename}"
    
    # 3. Log into Database
    new_log = models.AuditLog(
        worker_id=worker_id,
        location=point_wkt,
        anomaly_flag=1 if is_suspicious else 0,
        photo_url=photo_url
    )
    
    db.add(new_log)
    
    # 4. If this is tied to a specific task, mark it 'completed'
    if task_id:
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if task:
            task.status = "completed"
            task.completed_by = worker_id
            
    db.commit()
    db.refresh(new_log)
    
    return {"status": "success", "anomaly_flagged": is_suspicious, "log_id": new_log.id, "photo_url": photo_url}

@app.get("/api/logs")
def get_audit_logs(db: Session = Depends(database.get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(100).all()
    # Serialize data manually due to PostGIS column requiring specific conversion or dropping
    result = []
    for log in logs:
        # Get point coordinates from WKT (POINT(73.8224 15.8929))
        # Note: GeoAlchemy2 location string looks like: '0101000020E6100000787A13CFC8745240BC74931804C92F40' usually in Python,
        # Or we can query the ST_AsText(location). For simplicity, we can fetch X and Y using db.scalar
        from sqlalchemy import func
        pt_wkt = db.scalar(func.ST_AsText(log.location))
        
        # Super simple WKT string split: POINT(73.8224 15.8929) -> lat/lng
        lng_str, lat_str = pt_wkt.replace('POINT(', '').replace(')', '').split()
        
        result.append({
            "id": log.id,
            "worker_id": log.worker_id,
            "lat": float(lat_str),
            "lng": float(lng_str),
            "timestamp": log.timestamp.isoformat(),
            "anomaly_flag": log.anomaly_flag,
            "photo_url": log.photo_url
        })
    return result

@app.post("/api/login")
def login_user(req: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(
        (models.User.username == req.username) | (models.User.email == req.username)
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        },
        "token": f"mock_jwt_token_for_{user.id}"
    }

@app.post("/api/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        return {"status": "success", "message": "If that email exists, a reset link has been sent."}
    
    reset_token = secrets.token_urlsafe(32)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    
    print(f"\n=======================================================")
    print(f"📧 EMAIL MOCK: Password Reset Requested")
    print(f"To: {user.email} (User: {user.username})")
    print(f"Subject: NeuraX Municipal Tracker - Password Reset")
    print(f"Body: Please click the following link to reset your password:\n{reset_link}")
    print(f"=======================================================\n")
    
    return {"status": "success", "message": "If that email exists, a reset link has been sent."}

@app.post("/api/assess-worksite")
async def assess_worksite(
    lat: float = Form(...),
    lng: float = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Save the uploaded image
    photo_url = None
    if photo and photo.filename:
        ext = photo.filename.split('.')[-1]
        unique_filename = f"assess_{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("app/static/uploads", unique_filename)
        with open(filepath, "wb") as f:
            f.write(await photo.read())
        photo_url = f"static/uploads/{unique_filename}"
        
        # Pass to the AI Engine
        workers_needed = ml_engine.ml_engine.estimate_workforce_needed(filepath, lat, lng)
        
        # Save assessment as a new Task
        new_task = models.Task(
            lat=lat,
            lng=lng,
            photo_url=photo_url,
            estimated_workers=workers_needed,
            status="pending"
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        
        return {
            "status": "success",
            "task_id": new_task.id,
            "estimated_workers": workers_needed,
            "photo_url": photo_url,
            "message": f"AI Assessment complete. Task generated for {workers_needed} personnel."
        }
    
    raise HTTPException(status_code=400, detail="Photo is required for AI Assessment")

@app.get("/api/tasks")
def get_pending_tasks(db: Session = Depends(database.get_db)):
    tasks = db.query(models.Task).filter(models.Task.status == "pending").order_by(models.Task.created_at.desc()).all()
    return tasks

@app.get("/")
def health_check():
    return {"status": "API is running"}