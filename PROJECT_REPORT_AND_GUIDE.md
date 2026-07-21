# 🏙️ CivicRadar AI — Project Report & Complete User Guide
> **Smart Urban Problem Radar, AI Priority Engine & Transparent Municipal Resolution System**

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Tech Stack](#2-system-architecture--tech-stack)
3. [Core Features & Technical Breakdown](#3-core-features--technical-breakdown)
4. [Artificial Intelligence & Machine Learning Models](#4-artificial-intelligence--machine-learning-models)
5. [Complete User Guide](#5-complete-user-guide)
   - [Citizen Workflow](#citizen-workflow)
   - [Admin / Municipal Workflow](#admin--municipal-workflow)
6. [API Reference & Database Schema](#6-api-reference--database-schema)
7. [Deployment & Environment Setup](#7-deployment--environment-setup)

---

## 1. Executive Summary

**CivicRadar AI** is a next-generation civic tech platform designed to bridge the gap between citizens and municipal city departments. It allows residents to report infrastructure problems (potholes, streetlights, garbage, water leaks, traffic signal failures) directly onto an interactive map with GPS accuracy and photos.

The system incorporates **Artificial Intelligence (NLP & Machine Learning)** to automatically score issue urgency, route complaints to the appropriate municipal board, predict failure hotspot zones, and enforce **Transparent Resolution Proof (Before & After verification)**.

### Key Highlights
- **100% Mobile-Responsive**: Seamless bottom-sheet navigation and touch controls for smartphones and tablets.
- **AI-Powered Urgency Scoring**: Scikit-Learn NLP model reads descriptions and categorizes urgency (`High`, `Medium`, `Low`).
- **Automated Departmental Routing**: Auto-dispatches issues to PWD, Electricity Board, Sanitation, Water Board, or Traffic Police.
- **Before & After Proof**: Admins must submit a repair photo and work notes before marking any issue resolved.
- **Predictive Risk Zones**: Spatial K-Means clustering identifies emerging high-risk failure zones on the map.
- **Real-Time WebSockets**: Live updates sync across all devices instantly without page refreshes.

---

## 2. System Architecture & Tech Stack

```
                               ┌────────────────────────────────┐
                               │     CivicRadar Web Client      │
                               │  (React 18 + Vite + Tailwind)  │
                               └──────────────┬─────────────────┘
                                              │
                     HTTP REST API            │      WebSocket Live Feed
               ┌──────────────────────────────┴──────────────────────────────┐
               ▼                                                             ▼
┌──────────────────────────────┐                             ┌──────────────────────────────┐
│     FastAPI Backend Server   │                             │   Real-Time Socket Manager   │
│  (Python 3.11 / Uvicorn)     │                             │      (FastAPI WebSockets)     │
└──────────────┬───────────────┘                             └──────────────────────────────┘
               │
       ┌───────┴────────────────────────┬────────────────────────┐
       ▼                                ▼                        ▼
┌──────────────┐                 ┌──────────────┐         ┌──────────────┐
│ SQLite / DB  │                 │  Scikit NLP  │         │ Spatial ML   │
│ (SQLAlchemy) │                 │ (Urgency AI) │         │ (K-Means Zone│
└──────────────┘                 └──────────────┘         └──────────────┘
```

### Technology Stack
* **Frontend**: React 18, Vite, TailwindCSS, React-Leaflet (Google Hybrid Satellite tiles), Lucide Icons, Socket.io client pattern.
* **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Uvicorn ASGI Server, WebSockets.
* **AI / Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib (Natural Language Processing + Spatial Clustering).
* **Database**: SQLite (Development) / PostgreSQL (Production ready).
* **Hosting Configuration**: Vercel (Frontend SPA Routing) + Render (Backend Web Service).

---

## 3. Core Features & Technical Breakdown

### 📍 1. Interactive Map Engine & Location Picker
- **Google Hybrid Imagery**: High-detail satellite tiles overlaying road networks for pinpoint accuracy.
- **Center-Pin Interactive Picker**: Users drag the map under a fixed center pin to select precise coordinates.
- **Reverse Geocoding**: Automatically converts latitude/longitude into human-readable street addresses via Nominatim OpenStreetMap API.
- **Mobile High-Accuracy GPS**: One-tap `📍` button detects user location with device GPS sensors.

### 📸 2. "Before & After" Resolution Proof System
- **Citizen Report**: Citizen submits initial report photo ("Before").
- **Admin Verification**: When marking an issue done, admins must attach an "After" repair photo (via live camera stream or file upload) along with official completion notes.
- **Transparency Showcase**: Resolved issues display side-by-side **Before vs After** image cards and work notes to guarantee work authenticity.

### 🏢 3. Automated Municipal Department Routing
Reports are dynamically mapped to responsible government bodies upon submission:
- 🛣️ **Potholes / Road Damage** ➔ `PWD / Roads Department`
- 💡 **Broken Streetlights** ➔ `Electricity & Lighting Board`
- 🧹 **Garbage Overflow** ➔ `Sanitation & Waste Management`
- 🚰 **Water Leaks / Pipeline** ➔ `Water Supply & Sewerage Board`
- 🚦 **Traffic Signals** ➔ `Traffic & Transit Authority`

### 👍 4. Community Upvoting ("Me Too") & Escalation
- Citizens can click **"👍 I See This Too"** to upvote existing issues.
- **Dynamic Urgency Escalation**: Upvotes automatically upgrade priority in real-time (5+ upvotes ➔ Medium, 20+ upvotes ➔ High).

### 📊 5. Admin Dashboard & CSV Report Export
- Real-time overview of total reports, high-priority counts, pending issues, and resolved statistics.
- **Department Filter Bar**: Allows admins to view issues assigned to specific municipal boards.
- **Export CSV**: Generates structured `.csv` reports for city council meetings.

---

## 4. Artificial Intelligence & Machine Learning Models

### Model 1: Urgency Classifier (Natural Language Processing)
* **Location**: `backend/services/priority_service.py` & `ai-engine/urgency_model/`
* **Algorithm**: `RandomForestClassifier` with TF-IDF Feature Extraction.
* **Function**: Analyzes complaint descriptions for emergency keywords, danger severity, and public safety impact to assign urgency (`High`, `Medium`, `Low`).

### Model 2: Hotspot Risk Zone Predictor (Spatial Machine Learning)
* **Location**: `backend/services/hotspot_service.py` & `ai-engine/hotspot_model/`
* **Algorithm**: `K-Means` Spatial Clustering.
* **Function**: Clusters geographic report coordinates across the city to identify high-density failure areas, drawing red predictive **Risk Zones** on the map for preventive city maintenance.

---

## 5. Complete User Guide

### Citizen Workflow

1. **Viewing the Map**:
   - Open [http://localhost:5173](http://localhost:5173).
   - Drag the map or search an address in the top search bar.
   - Click **📍** to center on your current GPS location.

2. **Reporting an Issue**:
   - Click the red **📸 Report Problem** button.
   - Enter issue title, select category, and drag the map pin to the exact location.
   - Snap a live photo with your camera or select an image file.
   - Enter a brief description and click **Submit Report**.

3. **Interacting & Viewing Proof**:
   - Click any marker pin on the map to view issue details.
   - Click **👍 I See This Too** to upvote an issue.
   - For **Resolved** issues, view the side-by-side **Before & After** photos and admin work notes!

---

### Admin / Municipal Workflow

1. **Accessing Admin Panel**:
   - Navigate to [http://localhost:5173/admin](http://localhost:5173/admin).

2. **Filtering by Department**:
   - Click department tabs (e.g., *PWD / Roads Department*, *Electricity Board*) to focus on your department's queue.

3. **Inspecting Reports**:
   - Click any row in the table to open the full report detail view (includes auto-geocoded address, priority, upvotes, description, and original photo).

4. **Posting Resolution Proof**:
   - Click **Mark Done & Proof**.
   - Attach an "After" repair photo (via live camera or file upload).
   - Enter completion work notes (e.g., *"Asphalt patching completed by Ward 4 team"*).
   - Click **Complete & Mark Done**. The status updates live across all citizen screens!

5. **Exporting Official Reports**:
   - Click **Export CSV** to download a formatted spreadsheet of all complaints and resolutions.

---

## 6. API Reference & Database Schema

### Database Schema (`reports` table)
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique Report ID |
| `title` | String | Issue Title |
| `description` | Text | Detailed description |
| `type` | String | Category (Pothole, Streetlight, etc.) |
| `department` | String | Assigned Municipal Department |
| `latitude` | Float | GPS Latitude |
| `longitude` | Float | GPS Longitude |
| `image_url` | String (Base64) | Original "Before" Photo Data |
| `urgency_level` | String | High / Medium / Low |
| `upvotes` | Integer | Community upvote count |
| `status` | String | Reported / In Progress / Resolved |
| `resolution_image_url` | String (Base64) | Verified "After" Photo Data |
| `resolution_notes` | Text | Admin repair completion notes |
| `resolved_at` | DateTime | Timestamp when marked resolved |
| `created_at` | DateTime | Creation timestamp |

### Key API Endpoints
- `POST /api/reports` — Submit new report (runs AI urgency scoring & department routing).
- `GET /api/reports` — Fetch reports (supports `?department=` filter).
- `PUT /api/reports/{id}` — Update report status, urgency, or submit resolution proof.
- `POST /api/reports/{id}/upvote` — Citizen upvote endpoint (triggers auto-escalation).
- `GET /api/hotspots` — Runs K-Means spatial ML clustering to return risk zones.
- `GET /api/stats` — Aggregated dashboard statistics.
- `WebSocket /ws` — Real-time event push stream (`NEW_REPORT`, `UPDATE_REPORT`, `UPVOTE_REPORT`).

---

## 7. Deployment & Environment Setup

### Running Locally
```bash
# 1. Start Backend Server
cd backend
.\venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 2. Start Frontend Client (in separate terminal)
cd frontend
npm run dev
```

### Production Deployment Strategy
- **Frontend**: Deployed on **Vercel** (`vercel.json` configured for SPA rewrites).
- **Backend**: Deployed on **Render** (`render.yaml` configured for Uvicorn ASGI).

---

*Report Generated for CivicRadar AI Platform · Fully Complete & Verified.*
