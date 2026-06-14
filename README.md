# Hotel PMS — Property Management System

A full-stack Hotel Property Management System with a premium UI, built with FastAPI, React, and MongoDB Atlas.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS        |
| Backend    | FastAPI, Python, Uvicorn            |
| Database   | MongoDB Atlas (cloud)               |
| Auth       | JWT (python-jose + bcrypt)          |
| UI Icons   | Material Symbols, React Icons       |
| HTTP       | Axios                               |
| Deployment | Vercel (frontend + backend)         |

---

## Modules

| Module       | Description                                      |
|--------------|--------------------------------------------------|
| Auth         | JWT login/register with role-based access        |
| Dashboard    | Real-time stats with 30s auto-refresh            |
| Rooms        | CRUD for room inventory with status tracking     |
| Bookings     | Reservation management with date validation      |
| Check-In/Out | Guest arrival/departure with invoice generation  |
| Invoice      | Professional invoice viewer with print support   |
| Calendar     | Monthly room availability matrix                 |

---

## Project Structure

```
hotel-pms/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── dependencies.py
│   ├── config.py
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py
│       ├── rooms.py
│       ├── bookings.py
│       ├── checkin.py
│       └── invoices.py
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/
        └── pages/
```

---

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Create `backend/.env`:
```env
MONGO_URI=your_mongodb_atlas_uri
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## Environment Variables

### Backend (Vercel)

| Variable                    | Description                  |
|-----------------------------|------------------------------|
| `MONGO_URI`                 | MongoDB Atlas connection URI |
| `SECRET_KEY`                | JWT signing secret           |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (default 1440) |

### Frontend (Vercel)

| Variable        | Description              |
|-----------------|--------------------------|
| `VITE_API_URL`  | Deployed backend base URL |

---

## Live Links

| Service  | URL                                          |
|----------|----------------------------------------------|
| Frontend | https://hotel-pms.vercel.app                 |
| Backend  | https://hotel-pms-backend.vercel.app         |
| API Docs | https://hotel-pms-backend.vercel.app/docs    |

---

## Built By

**Milind Lanje**  
MIT Academy of Engineering, Pune  
B.Tech Computer Engineering — 2023–2027

---

## License

MIT
