from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255);"))
    except:
        pass
    conn.execute(text("UPDATE users SET email = 'admin@neurax.com' WHERE username = 'admin_super' AND email IS NULL;"))
    conn.execute(text("UPDATE users SET email = 'worker@neurax.com' WHERE username = 'worker_101' AND email IS NULL;"))
    conn.commit()
    print("Migration successful: added email column and seeded emails.")
