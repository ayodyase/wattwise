# ⚡ WattWise — Intelligent Energy Consumption Prediction & Tariff Analytics Platform

![WattWise CI/CD](https://github.com/ayodyase/wattwise/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![React](https://img.shields.io/badge/React-v18-cyan.svg)
![Python](https://img.shields.io/badge/Python-v3.12-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**WattWise** is a full-stack smart energy forecasting and bill estimation web application tailored for Sri Lankan residential households and commercial property managers. Powered by a **Random Forest Regressor** trained on environmental sensor and appliance telemetry, WattWise delivers hourly Wh forecasts, instant itemized **Ceylon Electricity Board (CEB) 2024 Residential Tariff** calculations, solar net-accounting payback simulations, and an enterprise multi-role administration console.

---

## 📐 System & Software Engineering Diagrams

### 1. 🏛️ High-Level System Architecture Diagram

```mermaid
graph TD
    Client["React 18 + Vite Frontend (Port 3000)<br/>Glassmorphic Dark Theme • Lucide Icons • Recharts"]
    
    subgraph Backend_Layer ["Node.js Express REST API (Port 5000)"]
        AuthMiddleware["JWT Auth & Role Guard"]
        ValidateMiddleware["Input Validation Middleware"]
        CEBEngine["CEB 2024 Tariff Slab Engine"]
        Controllers["Predict / Bill / Building / Tips / Admin Routes"]
    end
    
    subgraph Data_Layer ["Data & Storage"]
        MongoDB[("MongoDB Atlas Cloud<br/>Users, Predictions, Buildings, Tips, Alerts, Audits")]
    end

    subgraph ML_Microservice ["Python Flask ML Microservice (Port 5001)"]
        FlaskAPI["Flask REST API"]
        RFModel["Random Forest Regressor (150 Trees)"]
        Scaler["StandardScaler (30 Features)"]
    end

    Client -->|HTTP / JSON Requests| AuthMiddleware
    AuthMiddleware --> ValidateMiddleware
    ValidateMiddleware --> Controllers
    Controllers -->|Mongoose Queries| MongoDB
    Controllers -->|Slab Breakdown| CEBEngine
    Controllers -->|POST /predict & /predict-bulk| FlaskAPI
    FlaskAPI --> Scaler
    Scaler --> RFModel
```

---

### 2. 🎭 System Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        U(("👤 Regular User<br/>(Household Member)"))
        A(("🛡️ System Admin<br/>(Admin + Analyst + Building Mgr)"))
    end

    subgraph User_Capabilities ["Household User Use Cases"]
        UC1(["⚡ Run Energy Prediction (Wh)"])
        UC2(["🇱🇰 Calculate CEB Monthly Bill"])
        UC3(["☀️ Simulate Rooftop Solar PV Offset"])
        UC4(["📜 View & Export Prediction History (CSV/PDF)"])
        UC5(["💡 Browse Energy Saving Tips Library"])
        UC6(["📝 Manage User Profile"])
    end

    subgraph Admin_Capabilities ["Administrative & Analyst Use Cases"]
        AC1(["👥 Manage Accounts (Suspend / Role Toggle / Delete)"])
        AC2(["➕ Register New Admin Accounts (Admin Only)"])
        AC3(["📊 Query Anonymized Analyst Dataset & Export CSV"])
        AC4(["🏢 Multi-Unit Building & Alert Threshold Management"])
        AC5(["🏗️ Simulate Whole-Building Energy Load"])
        AC6(["📑 Process Batch CSV Telemetry Files"])
        AC7(["🔄 Trigger ML Random Forest Retraining & Evaluation"])
        AC8(["📢 Broadcast System Announcements"])
        AC9(["🔒 Review Security & Activity Audit Trail"])
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6

    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6
    A --> AC1
    A --> AC2
    A --> AC3
    A --> AC4
    A --> AC5
    A --> AC6
    A --> AC7
    A --> AC8
    A --> AC9
```

---

### 3. 🧩 Database & Backend Class Diagram (Mongoose Models)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role ("user" | "admin")
        +String status ("active" | "suspended")
        +String city
        +String phone
        +Date createdAt
        +comparePassword(enteredPassword) Boolean
    }

    class Prediction {
        +ObjectId _id
        +ObjectId userId
        +ObjectId buildingId
        +Number indoorTemp
        +Number outdoorTemp
        +Number indoorHumidity
        +Number outdoorHumidity
        +Number occupants
        +Number appliancesActive
        +Number hour
        +String dayOfWeek
        +String buildingType ("House" | "Apartment" | "Office")
        +Number predictedWh
        +Number lightsWh
        +String usageCategory ("Low" | "Normal" | "High" | "Very High")
        +Number estimatedCostLKR
        +Date createdAt
    }

    class Building {
        +ObjectId _id
        +String name
        +String type ("House" | "Apartment" | "Office")
        +ObjectId managerId
        +Number floorsCount
        +Number unitsCount
        +String location
        +Number alertThresholdWh
        +Date createdAt
    }

    class Tip {
        +ObjectId _id
        +String title
        +String content
        +String usageLevel ("All" | "Low" | "Normal" | "High" | "Very High")
        +String appliance ("General" | "AC" | "Fridge" | "Lighting" | "Water Heater")
        +Number potentialSavingsPercent
        +ObjectId createdBy
        +Date createdAt
    }

    class Alert {
        +ObjectId _id
        +ObjectId buildingId
        +Number floorNumber
        +Number predictedWh
        +Number thresholdWh
        +String severity ("Low" | "Medium" | "High" | "Critical")
        +String message
        +Date createdAt
    }

    class AuditLog {
        +ObjectId _id
        +ObjectId userId
        +String userName
        +String action
        +String details
        +Date createdAt
    }

    class Announcement {
        +ObjectId _id
        +String title
        +String message
        +String badge
        +ObjectId createdBy
        +Date createdAt
    }

    User "1" --> "*" Prediction : logs
    User "1" --> "*" Building : manages
    User "1" --> "*" AuditLog : generates
    User "1" --> "*" Tip : authors
    User "1" --> "*" Announcement : broadcasts
    Building "1" --> "*" Alert : triggers
    Building "1" --> "*" Prediction : associates
```

---

### 4. 🔄 Sequence Diagram 1: Energy Prediction & Real-Time Telemetry Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Household User / Admin
    participant Frontend as React Predictor UI
    participant Backend as Express API Server
    participant Auth as Auth & Validate Middleware
    participant Flask as Flask ML Microservice
    participant RF as Random Forest Regressor
    participant CEB as CEB Tariff Slab Engine
    participant DB as MongoDB Atlas

    User->>Frontend: Select Inputs (Temp, Humidity, Occupants, Appliances, Hour)
    Frontend->>Backend: POST /api/predict (Bearer JWT Token, Payload)
    Backend->>Auth: Verify JWT & Validate Sensor Bounds
    Auth-->>Backend: Authentication & Validation OK

    Backend->>Flask: POST /predict (Sensor Features + User Telemetry)
    Flask->>Flask: Normalize 30-feature vector with StandardScaler
    Flask->>RF: model.predict(scaled_features)
    RF-->>Flask: Return predicted Wh (e.g. 258.93 Wh)
    Flask->>Flask: Compute usage category, lights Wh, & print CMD log
    Flask-->>Backend: HTTP 200 { predictedWh, lightsWh, usageCategory, cost }

    Backend->>CEB: calculateCEBBill(monthlyUnits)
    CEB-->>Backend: Itemized 6-slab cost breakdown & tips
    Backend->>DB: Prediction.create() [Save record]
    Backend->>Backend: Output [WATTWISE PREDICTION EVENT] to CMD Terminal
    Backend-->>Frontend: HTTP 200 JSON Response

    Frontend-->>User: Display Wh Gauge, Load Badge, CEB Bill Slabs & Actionable Tips
```

---

### 5. 🔐 Sequence Diagram 2: Authentication & Admin-Only Admin Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest User
    actor Admin as System Administrator
    participant Frontend as React Client
    participant AuthAPI as Express Auth Router
    participant AdminAPI as Express Admin Router
    participant DB as MongoDB Atlas

    Note over Guest,Frontend: 1. Public Self-Registration (Strictly Regular User)
    Guest->>Frontend: Enters Name, Email, Password
    Frontend->>AuthAPI: POST /api/auth/register
    AuthAPI->>AuthAPI: Enforce role = 'user' (Hardened)
    AuthAPI->>DB: User.create({ role: 'user' })
    AuthAPI-->>Frontend: HTTP 201 { token, user: { role: 'user' } }

    Note over Admin,Frontend: 2. Administrator Creates Another Admin
    Admin->>Frontend: Opens Admin Console -> User Accounts
    Admin->>Frontend: Clicks "+ Register New Admin" & submits form
    Frontend->>AdminAPI: POST /api/admin/create-admin (Bearer Admin JWT)
    AdminAPI->>AdminAPI: Verify caller is Admin
    AdminAPI->>DB: User.create({ role: 'admin' })
    AdminAPI->>DB: AuditLog.create("ADMIN_CREATE_ADMIN")
    AdminAPI-->>Frontend: HTTP 201 "Admin account created successfully"
    Frontend-->>Admin: Show Success Toast & Refresh User List
```

---

### 6. 📈 Sequence Diagram 3: Energy Analyst Query & Dataset Export Flow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Energy Analyst / Admin
    participant UI as Admin Analytics Console
    participant Backend as Express Analyst Router
    participant DB as MongoDB Atlas

    Analyst->>UI: Select Filter Criteria (Property Type, Wh Range, Hour Window)
    Analyst->>UI: Clicks "Execute Query"
    UI->>Backend: POST /api/analyst/query (Filter Parameters)
    Backend->>DB: Prediction.find(queryCriteria).sort({ createdAt: -1 })
    DB-->>Backend: Matching Historical Telemetry Records
    Backend->>Backend: Compute Aggregate Stats (Count, Mean Wh, Total Cost)
    Backend-->>UI: HTTP 200 { totalMatching, records, summary }
    UI-->>Analyst: Render Filtered Dataset Table

    Analyst->>UI: Clicks "Export Filtered CSV"
    UI->>UI: Format Records into CSV Blob & Trigger Browser Download
    UI-->>Analyst: Download `wattwise_analyst_query_YYYY-MM-DD.csv`
```

---

### 7. ⚡ Decision & Activity Diagram: CEB 2024 Residential Tariff Slab Algorithm

```mermaid
flowchart TD
    Start(["Start Bill Calculation (Monthly Units: U)"]) --> CheckSlab{Monthly Units U}

    CheckSlab -->|U <= 30| S1["Slab 1: 0 - 30 units<br/>Energy: U * Rs. 2.50<br/>Fixed Charge: Rs. 180.00"]
    CheckSlab -->|31 <= U <= 60| S2["Slab 2: 31 - 60 units<br/>30 @ Rs. 2.50 + (U-30) @ Rs. 4.85<br/>Fixed Charge: Rs. 240.00"]
    CheckSlab -->|61 <= U <= 90| S3["Slab 3: 61 - 90 units<br/>30 @ Rs. 2.50 + 30 @ Rs. 4.85 + (U-60) @ Rs. 7.85<br/>Fixed Charge: Rs. 360.00"]
    CheckSlab -->|91 <= U <= 120| S4["Slab 4: 91 - 120 units<br/>30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + (U-90) @ 10.00<br/>Fixed Charge: Rs. 960.00"]
    CheckSlab -->|121 <= U <= 180| S5["Slab 5: 121 - 180 units<br/>30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + 30 @ 10.00 + (U-120) @ 27.75<br/>Fixed Charge: Rs. 1,500.00"]
    CheckSlab -->|U > 180| S6["Slab 6: 181+ units (Highest Tier)<br/>30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + 30 @ 10.00 + 60 @ 27.75 + (U-180) @ 45.00<br/>Fixed Charge: Rs. 2,000.00"]

    S1 --> Sum["Total Bill = Energy Charge + Fixed Charge + Fuel Surcharge"]
    S2 --> Sum
    S3 --> Sum
    S4 --> Sum
    S5 --> Sum
    S6 --> Sum

    Sum --> Tips["Attach Tier-Specific Energy Saving Advice"]
    Tips --> End(["Return Itemized JSON Result"])
```

---

### 8. 🌐 Deployment & DevOps CI/CD Architecture Diagram

```mermaid
graph LR
    subgraph Development_Environment ["Local & CI/CD Pipeline"]
        GitRepo["GitHub Repository<br/>ayodyase/wattwise"]
        GHActions["GitHub Actions CI Pipeline<br/>.github/workflows/ci.yml"]
        BackendCI["Node.js & CEB Tariff Unit Tests"]
        FrontendCI["React Vite Build Verification"]
        MLCI["Python 3.12 Flask Sanity Checks"]
    end

    subgraph Production_Deployment ["Live Runtime Stack"]
        Browser["User Web Browser<br/>(Port 3000)"]
        NodeServer["Node.js Express REST API<br/>(Port 5000)"]
        FlaskServer["Python Flask ML Microservice<br/>(Port 5001)"]
        MongoCluster[("MongoDB Atlas Cloud Database")]
    end

    GitRepo -->|Push / Pull Request| GHActions
    GHActions --> BackendCI
    GHActions --> FrontendCI
    GHActions --> MLCI

    Browser -->|HTTP/HTTPS| NodeServer
    NodeServer -->|REST POST| FlaskServer
    NodeServer -->|Mongoose TLS| MongoCluster
```

---

## 🌟 Key Features

### 1. 🏠 Household Energy Consumption Predictor
- Predicts hourly energy consumption in **Watt-hours (Wh)** and equivalent **kWh**.
- Accepts environmental metrics: Indoor/Outdoor Temperature (°C), Relative Humidity (%), Occupancy, Hour of Day (0–23), Day of Week, and active household appliances (AC, Refrigerator, Lighting, TV, Washing Machine, Water Heater).
- **Quick Preset Simulations**: 🌅 *Morning Routine*, ☀️ *Hot Afternoon Peak*, 🌆 *Evening High Load*, 🌙 *Night Standby*.
- Classifies load into **Low** (<80 Wh), **Normal** (80–180 Wh), **High** (181–350 Wh), and **Very High** (>350 Wh).
- Instant PDF/Print export of energy forecasts.

### 2. 🇱🇰 Sri Lanka CEB 2024 Residential Tariff Engine
Computes itemized monthly electricity bills based on the latest 2024 Ceylon Electricity Board tiered slab structure:

| Consumption Tier (kWh/month) | Energy Charge (LKR / unit) | Fixed Monthly Charge (LKR) |
| :--- | :--- | :--- |
| **0 – 30 units** | Rs. 2.50 | Rs. 180.00 |
| **31 – 60 units** | Rs. 4.85 | Rs. 240.00 |
| **61 – 90 units** | Rs. 7.85 | Rs. 360.00 |
| **91 – 120 units** | Rs. 10.00 | Rs. 960.00 |
| **121 – 180 units** | Rs. 27.75 | Rs. 1,500.00 |
| **181+ units** | Rs. 45.00 | Rs. 2,000.00 |

### 3. ☀️ Rooftop Solar & Net-Accounting Offset Simulator
- Simulates grid-tied solar PV systems (1 kW to 20 kW).
- Calculates monthly generation based on regional Sri Lankan solar irradiance (4.5 to 5.4 peak sun hours/day).
- Projects monthly Rupee savings, CEB Net-Accounting tariff credits, investment payback period (Years), and annual CO₂ carbon offset (Tons/year).

### 4. 📊 Multi-Role Administrative & Analyst Workspace
- **User Accounts Manager**: Search, filter, suspend, delete, or promote users to Administrator.
- **Admin-Only Account Creation**: Dedicated secure registration of administrative team members.
- **Energy Analyst Query Engine**: Filter dataset records by Property Type, Category, Wh bounds, and hour windows with **One-Click CSV Export**.
- **Building Manager Multi-Unit Monitor**: Register property profiles (*House*, *Apartment*, *Office*), track floor counts, and simulate whole-building energy loads.
- **Batch CSV ML Processor**: Upload/paste multi-row CSV telemetry datasets for bulk Random Forest predictions with direct CSV result download.
- **CEB Energy Tips Repository**: CRUD operations for appliance-specific energy reduction guidelines.
- **Security Audit Logs & Live Announcements**: System-wide activity trail and broadcast banners.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios |
| **Backend REST API** | Node.js, Express 4, Mongoose 8, JWT (JSON Web Tokens), Bcrypt.js |
| **Database** | MongoDB Atlas / Local MongoDB |
| **Machine Learning** | Python 3.12, Flask, Flask-CORS, Scikit-Learn 1.6+, Pandas, NumPy, Joblib |
| **CI/CD Pipeline** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **Python** (v3.10 to v3.12)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/ayodyase/wattwise.git
cd wattwise
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or edit existing):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
FLASK_ML_URL=http://127.0.0.1:5001
NODE_ENV=development
```

---

### 4. Setup & Start Python ML Microservice
```bash
cd ml-services
python -m venv venv
.\venv\Scripts\activate          # On Windows
# source venv/bin/activate       # On Linux/macOS
pip install -r requirements.txt
python app.py
```
> Microservice starts on **`http://127.0.0.1:5001`**.

---

### 5. Setup & Start Node.js Backend API
In a second terminal:
```bash
cd backend
npm install
npm run seed     # Seeds default users, sample predictions, buildings, & tips
npm run dev      # Starts Express on port 5000
```
> Backend API starts on **`http://localhost:5000`**.

---

### 6. Setup & Start React Frontend
In a third terminal:
```bash
cd frontend
npm install
npm run dev
```
> Access the web application at **`http://localhost:3000`**.

---

## 🔑 Default Seed Credentials

After running `npm run seed` in the backend:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@wattwise.lk` | `Admin@123456` | Admin Console, Analyst Analytics, Building Manager, Retrain ML |
| **Regular User** | `user@wattwise.lk` | `User@123456` | Predictor, CEB Estimator, Solar Simulator, History Log, Profile |

---

## 🧪 Testing & Verification

### Run Automated Backend Integration Tests
```bash
cd backend
npm test
```
**Test Coverage Includes (15 / 15 Passed)**:
- Backend `/api/health` connectivity
- Exact CEB 2024 Tariff Slab mathematical accuracy (25, 50, 80, 110, 150, 200 kWh)
- User & Admin JWT authentication lifecycle
- Role security guards (verifies regular users receive `403 Forbidden` on admin endpoints)
- ML prediction endpoint integration & positive Wh output

### Build Frontend Production Assets
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
