from flask import Blueprint, jsonify
from app.models import TimeSlot

slots_bp = Blueprint("slots", __name__)

@slots_bp.route("/<int:slot_id>", methods=["GET"])
def get_slot(slot_id):
    slot = TimeSlot.query.get_or_404(slot_id)
    return jsonify(slot.to_dict())
