from flask import Blueprint, request, jsonify
from app import db
from app.models import Response, Participant, TimeSlot

responses_bp = Blueprint("responses", __name__)

VALID_STATUSES = ("available", "maybe", "unavailable")


@responses_bp.route("/", methods=["POST"])
def submit_response():
    data = request.get_json()
    token = data.get("token")
    slot_id = data.get("slot_id")
    status = data.get("status")

    if not all([token, slot_id, status]):
        return jsonify({"error": "token, slot_id, and status are required"}), 400

    if status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    participant = Participant.query.filter_by(token=token).first()
    if not participant:
        return jsonify({"error": "Invalid token"}), 403

    slot = TimeSlot.query.get(slot_id)
    if not slot:
        return jsonify({"error": "Slot not found"}), 404

    existing = Response.query.filter_by(slot_id=slot_id, participant_id=participant.id).first()
    if existing:
        existing.status = status
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    resp = Response(slot_id=slot_id, participant_id=participant.id, status=status)
    db.session.add(resp)
    db.session.commit()
    return jsonify(resp.to_dict()), 201


@responses_bp.route("/bulk", methods=["POST"])
def submit_bulk():
    """Submit or update multiple slot responses in a single request."""
    data = request.get_json()
    token = data.get("token")
    responses = data.get("responses", [])

    if not token:
        return jsonify({"error": "token is required"}), 400

    participant = Participant.query.filter_by(token=token).first()
    if not participant:
        return jsonify({"error": "Invalid token"}), 403

    results = []
    for item in responses:
        slot_id = item.get("slot_id")
        status = item.get("status")

        if not slot_id or status not in VALID_STATUSES:
            continue

        slot = TimeSlot.query.get(slot_id)
        if not slot:
            continue

        existing = Response.query.filter_by(slot_id=slot_id, participant_id=participant.id).first()
        if existing:
            existing.status = status
            results.append(existing.to_dict())
        else:
            resp = Response(slot_id=slot_id, participant_id=participant.id, status=status)
            db.session.add(resp)
            results.append({"slot_id": slot_id, "status": status})

    db.session.commit()
    return jsonify({"updated": len(results), "responses": results}), 200
