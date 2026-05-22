from app import create_app, db
from app.models import Event, TimeSlot, Participant, Response

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "Event": Event,
        "TimeSlot": TimeSlot,
        "Participant": Participant,
        "Response": Response,
    }

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
