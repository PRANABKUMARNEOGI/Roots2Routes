# 🌍 Roots2Routes

**Roots2Routes** is an intelligent travel routing and real-time crowd-management web application focused on sustainable tourism across Chhattisgarh, India. It reads real-time crowd telemetry to help visitors avoid heavily congested hotspots (like Chitrakote Falls) and dynamically reroutes them to comparable, low-crowd alternative destinations.

---

### Preview Of Website
<img width="1888" height="905" alt="Screenshot 2026-09-05 121459" src="https://github.com/user-attachments/assets/09aad7f5-58e6-4f40-9e9a-b85cb80521d0" />

<img width="1841" height="727" alt="Screenshot 2026-09-05 121514" src="https://github.com/user-attachments/assets/c880650b-aca5-4d12-8cff-3efacfdf619e" />

<img width="1591" height="796" alt="Screenshot 2026-09-05 121541" src="https://github.com/user-attachments/assets/23a40e4b-fe92-4d5b-a51c-d5a364b7f566" />

<img width="1810" height="713" alt="Screenshot 2026-09-05 121607" src="https://github.com/user-attachments/assets/44dadb26-bb83-470a-b653-daae5136bdf9" />

<img width="1509" height="620" alt="Screenshot 2026-09-05 121616" src="https://github.com/user-attachments/assets/cc6efbce-6916-4870-8fd3-f6c1640abc9c" />

<img width="1581" height="543" alt="Screenshot 2026-09-05 121628" src="https://github.com/user-attachments/assets/8e75ee41-1e5a-4eeb-a9b6-8d6fea2fe4d5" />


---
## 🚀 Key Features

* **Real-Time Capacity Indicators**: Live telemetry feeds tracking crowd percentages and queues across major regional destinations.
* **Smart In-App Trip Widget**: Category-based routing engine that instantly suggests alternative, lower-density options when a preferred spot hits high capacity.
* **On-Site QR Signage Integration**: Designed to help manage overflow crowds directly at entry points.
* **Responsive Destination Grid**: Interactive cards featuring local imagery, status badges, and dynamic redirection alerts.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Modern CSS (Flexbox/Grid), Vanilla JavaScript hosted on **GitHub Pages**.
* **Backend**: Node.js, Express hosted on **Railway**.
* **Data Flow**: Asynchronous `fetch` APIs communicating live telemetry between the frontend and backend services.

---
### Frontend Website Link:-

---

### Backend website link:-

---
## 📁 Project Structure

```text
Roots2Routes/
├── assests/                 # Image assets for destinations (Chitrakote, Tirathgarh, etc.)
├── roots2routes-backend/    # Node.js Express backend API
│   ├── src/                 # Backend source logic (aggregators, config, server)
│   ├── server.js            # Entry point for backend server
│   └── schema.sql           # Database schema
├── index.html               # Main frontend user interface & application logic
└── README.md                # Project documentation
```

---
### ⚙️ Setup and Deployment
### 1. Frontend (GitHub Pages)
The frontend static files reside in the root directory (index.html and assets).

Deployed automatically via GitHub Pages from the main branch.

### 2. Backend (Railway)
The backend API runs on Railway and exposes endpoints like:

GET /api/v1/destinations/live — Fetches real-time crowd capacities.

POST /api/v1/routes/recommend — Smart category-based route recommendation engine.
---

### Contribution Prompt
---

### Quick Push Command:
Once you create and save the `README.md` file in your root folder, run these commands in your terminal:
```powershell
git add README.md
git commit -m "Add project README documentation"
git push -f origin main
```

### 👨‍💻 Author:-Team Roots2Routes
