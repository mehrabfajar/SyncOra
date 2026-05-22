from datetime import datetime, timedelta

def generate_slots(event_type, start_date, end_date):
    slots = []

    if event_type == "fullday":
        current = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        while current <= end:
            slots.append({
                "start_dt": current,
                "end_dt": current.replace(hour=23, minute=59, second=59),
            })
            current += timedelta(days=1)

    elif event_type == "timebased":
        current = start_date.replace(minute=0, second=0, microsecond=0)
        while current < end_date:
            slot_end = current + timedelta(hours=1)
            if slot_end > end_date:
                slot_end = end_date
            slots.append({"start_dt": current, "end_dt": slot_end})
            current += timedelta(hours=1)

    return slots


def find_best_slot(slots):
    if not slots:
        return None
    max_score = max(s.score() for s in slots)
    if max_score == 0:
        return None
    best = [s for s in slots if s.score() == max_score]
    return best[0] if best else None


def check_quorum(event):
    if not event.participants:
        return False
    responded = set()
    for slot in event.slots:
        for r in slot.responses:
            responded.add(r.participant_id)
    return len(responded) >= event.quorum
