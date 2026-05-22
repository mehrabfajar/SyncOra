from flask import Blueprint, request, jsonify
from app import db
from app.models import Event, TimeSlot, Participant
from app.utils import generate_slots, find_best_slot, check_quorum
from datetime import datetime

events_bp = Blueprint("events", __name__)


def parse_dt(s):
    """Parse ISO 8601 datetime strings across all Python versions."""
    s = s.replace("Z", "").split("+")[0].split(".")[0]
    return datetime.fromisoformat(s)


@events_bp.route("/", methods=["POST"])
def create_event():
    data = request.get_json()

    required = ["title", "event_type", "start_date", "end_date", "creator_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing field: {field}"}), 400

    if data["event_type"] not in ("fullday", "timebased"):
        return jsonify({"error": "event_type must be 'fullday' or 'timebased'"}), 400

    try:
        start = parse_dt(data["start_date"])
        end = parse_dt(data["end_date"])
    except (ValueError, AttributeError):
        return jsonify({"error": "Invalid date format. Use ISO 8601."}), 400

    if end <= start:
        return jsonify({"error": "end_date must be after start_date"}), 400

    event = Event(
        title=data["title"],
        description=data.get("description", ""),
        event_type=data["event_type"],
        start_date=start,
        end_date=end,
        creator_name=data["creator_name"],
        quorum=int(data.get("quorum", 1)),
    )
    db.session.add(event)
    db.session.flush()

    for s in generate_slots(data["event_type"], start, end):
        db.session.add(TimeSlot(event_id=event.id, start_dt=s["start_dt"], end_dt=s["end_dt"]))

    db.session.commit()
    return jsonify(event.to_dict(include_slots=True)), 201


@events_bp.route("/<event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict(include_slots=True))


@events_bp.route("/<event_id>/join", methods=["POST"])
def join_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json()

    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    existing = Participant.query.filter_by(event_id=event_id, name=name).first()
    if existing:
        return jsonify({"participant": existing.to_dict(), "message": "Welcome back!"}), 200

    participant = Participant(event_id=event_id, name=name)
    db.session.add(participant)
    db.session.commit()
    return jsonify({"participant": participant.to_dict(), "message": "Joined successfully!"}), 201


@events_bp.route("/<event_id>/result", methods=["GET"])
def get_result(event_id):
    event = Event.query.get_or_404(event_id)
    quorum_reached = check_quorum(event)
    best = find_best_slot(event.slots)

    return jsonify({
        "event_id": event_id,
        "quorum_reached": quorum_reached,
        "participant_count": len(event.participants),
        "quorum_needed": event.quorum,
        "best_slot": best.to_dict() if best else None,
        "all_slots_ranked": [
            s.to_dict()
            for s in sorted(event.slots, key=lambda x: x.score(), reverse=True)
        ],
    })
