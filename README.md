# 📦 Order Management System with Automated Scheduler

A full-stack order management dashboard featuring automated order status transitions, execution logs, and a clean corporate light-theme React interface.

---

## 🛠️ Setup & Run Instructions

### 1. Backend Setup
1. Navigate to `backend/` and install dependencies:
   ```bash
   cd backend && npm install
   ```
2. Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   SCHEDULER_SECRET_KEY=my_secure_scheduler_secret_key_2026
   ```
3. Seed the database with mock orders (back-dated for scheduler testing):
   ```bash
   node seed.js
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to `frontend/` and install dependencies:
   ```bash
   cd ../frontend && npm install
   ```
2. Start React application:
   ```bash
   npm run dev
   ```
   *Dashboard runs on `http://localhost:3000` (auto-proxies requests to backend).*

---

## 📐 System Design & Architecture

### 1. Database & Collections
* **Database**: **MongoDB** is used for nested document modeling, allowing order transition timelines to be saved as an array within the order document without relational joins.
* **`orders` Collection**: Stores Order details, Payment status, and a sub-document array `statusHistory` tracking state changes (status, changedAt, reason).
* **`schedulerlogs` Collection**: Records execution metrics of scheduler runs (inspected orders list, updated orders counts, runtime duration, status, errors).

### 2. Duplicate Prevention & Race Conditions
* **Duplicate Prevention**: Database-level unique index on `orderId` prevents double insertions. Custom unique ID generator (`ORD-YYYYMMDD-XXXX`) creates unique IDs.
* **Race Condition Handling**: Utilizes Mongoose Optimistic Concurrency Control versioning (`__v`) to fail updates if another thread modified the document between check and save.

### 3. Scalability & Scheduler Design
* **Scale Strategy**: Horizontally scalable API nodes behind a load balancer. 
* **Scheduler Choice**: Powered by `node-cron` locally every 5 minutes. For multi-node production setups, a dedicated cloud scheduler (Google Cloud Scheduler / AWS EventBridge) triggers the secure, token-protected REST API `/api/scheduler/run` instead of local cron loops.

---

## 📡 API Endpoints

* **Create Order**: `POST /api/orders`
* **Get Orders (Filtered/Paged/Search)**: `GET /api/orders`
* **Trigger Scheduler Job (Secret Header Check)**: `POST /api/scheduler/run`
  * Header: `x-scheduler-key: my_secure_scheduler_secret_key_2026`
* **Get Scheduler Audit Logs**: `GET /api/scheduler/logs`
