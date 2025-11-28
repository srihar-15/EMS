# 🚀 Nexus HR - AI-Powered Workforce Management System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-orange)

> An enterprise-grade Employee Management System featuring Role-Based Access Control (RBAC), Multi-Level Approval Workflows, and Generative AI Analytics.

---

## 🏗 Architecture Overview

This project is built using the **MERN Stack** (MongoDB, Express, React, Node.js) with a modern, scalable architecture.

```
/
├── client/             # Frontend (React 19 + TypeScript + Zustand)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route views
│   │   ├── store/      # Global State (Zustand)
│   │   └── services/   # API & AI integrations
├── server/             # Backend (Node.js + Express)
│   ├── models.js       # Mongoose Schemas
│   └── index.js        # API Routes & Controllers
└── docs/               # Architecture & API Documentation
```

## 🔥 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Admin:** Full system access, audit logs, budget management.
- **HR Manager:** Leave approvals, attendance monitoring, performance reviews.
- **Employee:** Self-service portal (Profile, Leave Requests, Pay Slips).

### 2. 🧠 AI-Driven Analytics
- Integrated **Google Gemini 2.5 Flash** model.
- Analyzes raw workforce data to detect **Burnout Risks** and **Salary Disparities**.
- Provides actionable executive summaries in real-time.

### 3. ⚡ Core Modules
- **Leave Management:** Multi-tier approval workflow (HR → Admin escalation for long leaves).
- **Time & Attendance:** Digital punch-clock with geo-tagging simulation.
- **Audit Logging:** Immutable record of all system actions (SOC2 compliance readiness).
- **Financials:** Department-level budget utilization tracking.

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **State** | Zustand (Client-side), React Query patterns |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI Engine** | Google Generative AI SDK (@google/genai) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Instance (Local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/nexus-hr.git
   cd nexus-hr
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Create .env file with:
   # MONGO_URI=mongodb://localhost:27017/nexus_hr
   # API_KEY=your_gemini_key
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📄 Documentation

- [Architecture & Data Flow](./docs/ARCHITECTURE.md)
- [Database Schema (ERD)](./docs/DATABASE_SCHEMA.md)
- [API Reference](./docs/API_REFERENCE.md)

---

## 🧪 Security & Compliance

- **JWT Authentication** (Planned for v2)
- **Audit Trails:** All sensitive actions (Delete, Approve, Edit) are logged.
- **Route Guards:** Client-side permission checks prevent unauthorized view access.

---

© 2024 Nexus HR Systems. Built for demonstration purposes.