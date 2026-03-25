import traceback

try:
    from app.auth import get_password_hash
    print("Hash testing:", get_password_hash("password123"))
except Exception as e:
    with open("error_log.txt", "w") as f:
        f.write(traceback.format_exc())
    print("Exception written to error_log.txt")
