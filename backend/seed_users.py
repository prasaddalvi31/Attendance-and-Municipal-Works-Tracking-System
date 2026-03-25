from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

def seed_users():
    db = SessionLocal()
    
    # Worker
    worker = db.query(models.User).filter_by(username="worker_101").first()
    if not worker:
        worker = models.User(
            username="worker_101",
            email="worker@neurax.com",
            hashed_password=get_password_hash("password123"),
            role="worker"
        )
        db.add(worker)
        print("Created worker_101 with password: password123")
    else:
        worker.hashed_password = get_password_hash("password123")
        print("Updated worker_101 with password: password123")
        
    # Admin
    admin = db.query(models.User).filter_by(username="admin").first()
    if not admin:
        admin = models.User(
            username="admin",
            email="admin@neurax.com",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)
        print("Created admin with password: admin123")
    else:
        admin.hashed_password = get_password_hash("admin123")
        print("Updated admin with password: admin123")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_users()
