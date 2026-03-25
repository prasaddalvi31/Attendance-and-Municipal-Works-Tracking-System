from app.database import SessionLocal
from app.models import AuditLog

def check_logs():
    db = SessionLocal()
    logs = db.query(AuditLog).all()
    print(f"Total Logs: {len(logs)}")
    for log in logs:
        print(f"ID: {log.id}, anomaly: {log.anomaly_flag}, photo_url: {log.photo_url}")
    db.close()

if __name__ == "__main__":
    check_logs()
