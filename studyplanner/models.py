# models.py

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import date, datetime

db = SQLAlchemy()

# ----------------- User Model -----------------
class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    profiles = db.relationship('Profile', backref='user', lazy=True)
    planners = db.relationship('Planner', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

# ----------------- Profile Model -----------------
class Profile(db.Model):
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    syllabus_text = db.Column(db.Text, nullable=True)
    topics = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"<Profile {self.title}>"

# ----------------- Planner Model -----------------
class Planner(db.Model):
    __tablename__ = 'planner'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    scheduled_date = db.Column(db.Date, nullable=False, default=date.today)

    def __repr__(self):
        return f"<Planner {self.topic} on {self.scheduled_date}>"
