# SyncOra 🗓️

SyncOra lets a group of people find a time that works for everyone, without the endless back-and-forth. You create an event, share a short code, and participants vote on their availability. The app scores each slot automatically and highlights the best option once enough people have responded.

No accounts. No emails required. Just a link.

---

## Features

- Create events as full-day polls or hourly time slots
- Auto-generates all slots from a date range — no manual entry
- Participants vote directly from a shareable link, no login needed
- Live response grid showing everyone's availability at a glance
- Weighted scoring: available = 2pts, maybe = 1pt, unavailable = 0
- Automatic best-slot detection and quorum notification
- Participants can edit their responses at any time
- Results tab with visual breakdown per slot

---

## Screenshots

![Home](screenshots/home.png)
<br>
<p align="center">
  <img src="screenshots/create_event.png" width="49.5%" />
  <img src="screenshots/event.png" width="49.5%" />
</p>
<br>
<p align="center">
  <img src="screenshots/vote.png" width="49.5%" />
  <img src="screenshots/results.png" width="49.5%" />
</p>

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python 3.11 · Flask · SQLAlchemy  |
| Database   | SQLite (local) · PostgreSQL (prod)|
| Frontend   | React 18 · Vite · Tailwind CSS    |
| Deployment | Render (free tier)                |

---

## Project Structure

```
syncora/
├── backend/
│   ├── app/
│   │   ├── models/       # Event, Slot, Participant, Response
│   │   ├── routes/       # events, slots, responses
│   │   └── utils/        # slot generation, scoring, quorum logic
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios client
│   │   └── pages/        # Home, CreateEvent, EventView
│   ├── index.html
│   └── package.json
├── render.yaml
├── LICENSE
└── README.md
```

---

## Running Locally

### Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

### macOS / Linux

```bash
git clone https://github.com/YOUR_USERNAME/syncora.git
cd syncora

# Backend
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/python run.py &
cd ..

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### Windows

```bash
git clone https://github.com/YOUR_USERNAME/syncora.git
cd syncora

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

> Everything installs inside the project folder only — no system-wide changes. To uninstall, just delete the folder.

---

## Deploying to Render

Render is a free hosting platform. The `render.yaml` file in this repo configures everything automatically.

1. Push this repo to your GitHub account
2. Sign up at [render.com](https://render.com) and connect GitHub
3. Click **New → Blueprint** and select this repo
4. Render creates the backend, frontend, and database automatically
5. Once deployed, copy the backend URL (e.g. `https://syncora-backend.onrender.com`)
6. Open the **frontend service → Environment** tab in the Render dashboard
7. Set `VITE_API_URL` = `https://syncora-backend.onrender.com/api`
8. Save — the frontend redeploys and you're live

> **Free tier note:** Render spins down idle services after 15 minutes of inactivity. The first request after a sleep may take ~30 seconds to wake up.

---

## API

| Method | Endpoint                  | Description                         |
|--------|---------------------------|-------------------------------------|
| POST   | `/api/events/`            | Create a new event                  |
| GET    | `/api/events/:id`         | Get event details and all slots     |
| POST   | `/api/events/:id/join`    | Join an event as a participant      |
| GET    | `/api/events/:id/result`  | Get ranked results and best slot    |
| POST   | `/api/responses/bulk`     | Submit or update multiple responses |

---

## Context

Built as part of the **HackaPrompt AI Challenge** at the **University of Trento**. The project explores how AI-assisted development tools can accelerate the design and delivery of functional web applications from a prompt specification.

---

## License

MIT LICENSE - For educational Purpose 
