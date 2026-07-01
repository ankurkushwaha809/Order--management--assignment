# 📦 Order Management System with Automated Scheduler

A corporate order management dashboard built to monitor, track, and automate the lifecycle of product orders in real-time.

---

## 🌟 Core Features

* **Order Board Workspace**: View, search, and filter orders dynamically. Expand any order row to see its complete status transition timeline and history.
* **Fulfillment Automation (Scheduler)**: Background worker running on a 5-minute interval that automatically advances orders:
  * `PLACED` orders &rarr; `PROCESSING` (after 10 minutes)
  * `PROCESSING` orders &rarr; `READY_TO_SHIP` (after 20 minutes)
* **Automation Audit Logs**: A dedicated workspace showcasing logs of each background check run (scan time, checked orders count, auto-updated orders, and exact changes made).
* **Corporate Interface**: A clean, light-theme professional interface equipped with adjustable auto-refresh polling intervals (Off, 5s, 10s, 30s) and manual sync options.

---

## 🛠️ Setup & Running Locally

### 1. Backend Setup
1. Navigate to the `backend/` directory and install dependencies:
   ```bash
   cd backend && npm install
   ```
2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   SCHEDULER_SECRET_KEY=my_secure_scheduler_secret_key_2026
   ```
3. Inject simulated orders for time-based transition testing:
   ```bash
   node seed.js
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend/` directory and install dependencies:
   ```bash
   cd ../frontend && npm install
   ```
2. Launch React development environment:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` in your browser.*

---

## 📡 API Reference Documentation

### 📦 Order Management
* **Create Order**: `POST /api/orders`
  * Body:
    ```json
    {
      "customerName": "Ankur Kushwaha",
      "phone": "+919876543210",
      "productName": "OnePlus Nord Buds",
      "amount": 2499,
      "paymentStatus": "PENDING"
    }
    ```
* **List Orders (with filters)**: `GET /api/orders`
  * Query parameters:
    * `status`: Filter by status (`ALL`, `PLACED`, `PROCESSING`, `READY_TO_SHIP`, `DELIVERED`, `CANCELLED`).
    * `search`: Matches customer names or Order IDs.
    * `page` / `limit`: Pagination parameters.

### ⚙️ Scheduler Audits
* **Trigger Scheduler Manually**: `POST /api/scheduler/run`
  * Requires custom security header:
    `x-scheduler-key: my_secure_scheduler_secret_key_2026`
* **Fetch Scheduler Logs**: `GET /api/scheduler/logs`
  * Returns logs of the last 30 execution audits.
