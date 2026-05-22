from app import db
from datetime import datetime
import uuid

def gen_uuid():
    return str(uuid.uuid4())[:8]

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.String(8), primary_key=True, default=gen_uuid)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    event_type = db.Column(db.String(20), nullable=False)  # 'fullday' or 'timebased'
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    creator_name = db.Column(db.String(100), nullable=False)
    quorum = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    slots = db.relationship("TimeSlot", backref="event", cascade="all, delete-orphan", lazy=True)
    participants = db.relationship("Participant", backref="event", cascade="all, delete-orphan", lazy=True)

    def to_dict(self, include_slots=False):
        d = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "creator_name": self.creator_name,
            "quorum": self.quorum,
            "created_at": self.created_at.isoformat(),
            "participant_count": len(self.participants),
        }
        if include_slots:
            d["slots"] = [s.to_dict() for s in sorted(self.slots, key=lambda x: x.start_dt)]
            d["participants"] = [p.to_dict() for p in self.participants]
        return d


class TimeSlot(db.Model):
    __tablename__ = "time_slots"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.String(8), db.ForeignKey("events.id"), nullable=False)
    start_dt = db.Column(db.DateTime, nullable=False)
    end_dt = db.Column(db.DateTime, nullable=False)

    responses = db.relationship("Response", backref="slot", cascade="all, delete-orphan", lazy=True)

    def score(self):
        weights = {"available": 2, "maybe": 1, "unavailable": 0}
        return sum(weights.get(r.status, 0) for r in self.responses)

    def to_dict(self):
        counts = {"available": 0, "maybe": 0, "unavailable": 0}
        for r in self.responses:
            if r.status in counts:
                counts[r.status] += 1
        return {
            "id": self.id,
            "start_dt": self.start_dt.isoformat(),
            "end_dt": self.end_dt.isoformat(),
            "score": self.score(),
            "counts": counts,
            "responses": [r.to_dict() for r in self.responses],
        }


class Participant(db.Model):
    __tablename__ = "participants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.String(8), db.ForeignKey("events.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(32), default=lambda: str(uuid.uuid4()).replace("-", ""))
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    responses = db.relationship("Response", backref="participant", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "token": self.token,
            "joined_at": self.joined_at.isoformat(),
        }


class Response(db.Model):
    __tablename__ = "responses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    slot_id = db.Column(db.Integer, db.ForeignKey("time_slots.id"), nullable=False)
    participant_id = db.Column(db.Integer, db.ForeignKey("participants.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'available', 'maybe', 'unavailable'
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("slot_id", "participant_id"),)

    def to_dict(self):
        return {
            "id": self.id,
            "slot_id": self.slot_id,
            "participant_id": self.participant_id,
            "participant_name": self.participant.name if self.participant else "",
            "status": self.status,
            "updated_at": self.updated_at.isoformat(),
        }
