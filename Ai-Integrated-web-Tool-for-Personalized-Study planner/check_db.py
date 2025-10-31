# check_db.py
from app import app, db
from models import User, Profile, Planner
from sqlalchemy import text  # <-- import text

# Ensure we run inside app context
with app.app_context():
    # Create tables if they don't exist
    db.create_all()
    print("Tables created (if they didn't exist).")

    # List all tables
    with db.engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        print("Tables in database:", tables)
