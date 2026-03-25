# NeuraX Municipal Tracker

A comprehensive **Attendance and Municipal Works Tracking System**. This platform connects a centralized Admin Web Dashboard with a Worker Mobile App to easily assign worksite assessments, track field worker locations, verify attendance through photos, and seamlessly manage municipal infrastructure repairs.

## Features

- **Admin Web Command Center**: A React-based web portal for dispatchers to:
  - Generate automated AI assessments of worksites from uploaded incident photos (predicting crew size requirements).
  - Track worker locations on a live map in real-time.
  - Review submitted worksite photos and GPS coordinates from field workers.
  - Download performance SLA reports as PDFs.
- **Worker Mobile App**: An Expo React Native application allowing field workers to:
  - Check their assigned worksite assessments.
  - Capture and upload proof of repair photos linked exactly to their GPS location.
  - Process data offline (caching logs locally when no network is available).
- **Intelligent Backend**: FastAPI Python server powered by PostgreSQL and PostGIS for spatial data, featuring:
  - Machine Learning anomaly detection for route deviations.
  - Image processing heuristics to assign labor dynamically.
  - Robust authentication using JSON Web Tokens (JWT) and Bcrypt.

## Architecture

The system is separated into three main core directories:

1. `admin-web/`: The frontend React application.
2. `worker-mobile/`: The React Native mobile app built with Expo.
3. `backend/`: The FastAPI Python backend serving local APIs.
4. `database/`: A Docker-compose configuration for running PostgreSQL with the PostGIS extension.

## Getting Started

### 1. Database Setup
You will need Docker installed. This spins up the Postgres instance on port 5432.
```bash
cd database
docker-compose up -d
```

### 2. Backend Server
First, install the Python requirements:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
Then start the FastAPI application on `0.0.0.0` so your mobile app can connect to it over WiFi:
```bash
uvicorn app.main:app --host 0.0.0.0 --reload
```

### 3. Admin Web Portal
Open a new terminal and run the React web frontend:
```bash
cd admin-web
npm install
npm start
```
*Access the dashboard at `http://localhost:3000`.*

### 4. Worker Mobile App
Open another terminal to start the Expo local server:
```bash
cd worker-mobile
npm install
npm start -c
```
*Scan the QR code printed in the terminal with the Expo Go app on your phone to launch the app!*

## Development Test Accounts

By default, the database is seeded with the following test credentials:
- **Admin**: Username: `admin`, Password: `admin123`
- **Worker**: Username: `worker_101`, Password: `password123`

## License

This project is licensed for internal Municipal/Enterprise use.
