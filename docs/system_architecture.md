# System Architecture - City Problem Radar

## Purpose
A live city map where citizens report issues and AI prioritizes + predicts problem zones.
Not just “complaint box” — it becomes a city health dashboard.

## Core Components

### 1. Frontend (React + Map API)
- **Citizen Side**: Live map, photo report, status tracking.
- **Admin Dashboard**: Heatmaps, priority lists, analytics.
- **Tech**: React, Leaflet/Mapbox, Tailwind.

### 2. Backend (FastAPI)
- Handles authentication, report submission, image processing.
- **Tech**: FastAPI (Python), REST API.

### 3. AI Intelligence Layer
- **Urgency Classifier**: CNN + Text classification to detect urgency (High/Med/Low).
- **Hotspot Predictor**: Forecasts future problem zones using time-series data.
- **Performance Analyzer**: Tracks department efficiency.

### 4. Database (PostgreSQL + PostGIS)
- Stores users, reports (with spatial data), and action logs.

### 5. Real-time Engine
- WebSockets for instant updates of report status and map pins.

## Flow
1. Citizen submits issue (Photo + Location).
2. Report saved to DB.
3. AI assigns urgency score.
4. Authorities notified via Real-time Engine.
5. Status updated → Citizen notified.
