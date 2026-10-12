# Automated Aquaculture Monitoring System

A full-stack IoT web dashboard for monitoring aquaculture pond/tank conditions
(water temperature, pH, water level, turbidity), with remote control of
an aerator and automatic feeder, alerting, and historical analytics.

```
aquaculture-monitor/
├── frontend/   React + Vite + Tailwind dashboard
└── backend/    Express + MongoDB API (user auth + IoT ingest)
```

## Quick start — frontend only (demo / mock mode)

The frontend ships with a built-in mock-data layer so you can see and use
the entire dashboard without running the backend or having an ESP32 connected.

```bash
cd frontend
npm install
cp .env.example .env      # VITE_USE_MOCK_DATA=true by default
npm run dev
```

Open http://localhost:5173 — log in with any email/password (mock mode
accepts anything). Data is generated client-side and persisted to
localStorage so it survives page reloads.

## Full stack (real backend + MongoDB)

1. **Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # edit .env: set MONGO_URI, JWT_SECRET, IOT_API_KEY
   npm run dev
   ```

2. **Register the pond device** (creates the device the ESP32 will
   authenticate as, and prints its API key once):

   ```bash
   node seed.js POND-001
   ```

   Copy the printed `deviceApiKey` into your ESP32 firmware — it is stored
   only as a bcrypt hash in MongoDB and is never sent to the frontend.

3. **Frontend**

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # set VITE_USE_MOCK_DATA=false and VITE_API_URL=http://localhost:5000/api
   npm run dev
   ```

4. Create a user account from the Sign Up page, then log in.

## ESP32 integration

The device authenticates with `deviceId` + `x-device-api-key` header — a
separate mechanism from user JWTs (see `backend/middleware/deviceAuth.js`).

- `POST /api/iot/sensor-data` — send one reading
  ```json
  {
    "deviceId": "POND-001",
    "temperature": 28.4,
    "ph": 7.4,
    "waterLevel": 6.8,
    "turbidity": 3.2,
    "timestamp": "2026-08-23T15:20:00Z"
  }
  ```
  Header: `x-device-api-key: <raw key from seed.js>`

- `POST /api/iot/sensor-data/batch` — sync buffered SD-card readings after
  a Wi-Fi outage: `{ "deviceId": "POND-001", "readings": [ ... ] }`

- `GET /api/iot/device/:deviceId/commands` — poll for pending actuator
  commands (aerator on/off, feed now, sync time) issued from the dashboard.

- `POST /api/iot/device/status` — report Wi-Fi/sensor health and mark the
  device online.

- `POST /api/iot/device/commands/:commandId/ack` — confirm a command was
  executed.

Incoming readings are automatically checked against the device's configured
thresholds (`backend/services/alertService.js`) and raise deduplicated
alerts (15-minute cooldown per alert type). A background job
(`backend/services/deviceService.js`) marks a device offline — and raises a
`DEVICE_OFFLINE` alert — if it hasn't reported in `ALERT_OFFLINE_MINUTES`.

## Notes

- Passwords are hashed with bcrypt; device API keys are hashed with bcrypt
  too and only ever shown once, at creation time, by `seed.js`.
- Live Monitoring currently polls the API every 5 seconds. Swap this for a
  WebSocket subscription (e.g. Socket.IO) for true push updates — the
  REST endpoints remain as a fallback either way, matching the brief's
  "prefer WebSockets, keep REST available" requirement.
- Sensor thresholds live per-device on the `Device` model and are editable
  from Settings → Sensor Thresholds (wire this page to
  `PUT /api/devices/:id` in production; the mock layer already models this
  shape).
