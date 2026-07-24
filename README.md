# Smart Campus Enterprise Management ERP System

An enterprise-grade, full-stack University & Campus Management System built with React 18, TypeScript, Tailwind CSS, Express, MongoDB, and Gemini 2.5 AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Version](https://img.shields.io/badge/version-1.2.0--production-indigo)

---

## 🌟 Key Functional Modules

### 🏢 Core University Management
- **Multi-Role RBAC Authentication**: Secure access control for Administrators, Faculty Members, and Students with JWT tokens and bcrypt password hashing.
- **Academic & Course Catalog**: Full lifecycle management of University Courses, Credit hours, Syllabi, and Departmental affiliations.
- **Student Information System (SIS)**: Centralized records for enrollment, CGPA calculation, transcript generation, emergency contacts, and attendance history.
- **Faculty Directory & Workload**: Departmental faculty assignments, contact cards, office hours, and research focus areas.
- **Library Catalog Engine**: Digital book inventory, issue/return tracking, overdue fine calculation, and ISBN barcode search.
- **Hostel & Housing Portal**: Room allocation matrix, occupancy tracking, mess bill management, and warden tickets.
- **Transport Fleet Logistics**: Campus shuttle routes, live GPS simulation, driver contacts, and bus pass renewals.
- **Asset & Inventory Control**: Procurement records, equipment tracking across university labs, maintenance logs, and depreciation tracking.
- **Scholarships & Financial Aid**: Merit and need-based scholarship applications, award statuses, and stipend disbursement logs.
- **Staff Payroll System**: Faculty salary slips, tax deductions, bonus calculations, and payment disbursal statuses.
- **Fees & Invoice Management**: Online tuition fee payment gateway simulation, invoice generation, receipt PDF downloads, and pending dues tracking.

---

### 🚀 Modern Enterprise Features
- **PWA & Offline First**: Progressive Web App capabilities with offline Service Worker caching (`/sw.js`) and web app manifest (`manifest.json`).
- **Biometric & Smart Attendance Suite**:
  - **Dynamic QR Code**: Time-decaying security tokens for instant classroom check-in.
  - **AI Face Recognition**: Neural landmark scanning simulation with match confidence scores and liveness verification.
  - **RFID Smart Card**: Tap-to-check-in terminal simulation for campus gates and laboratories.
- **Real-Time Communication Hub**: WebSocket-enabled instant messaging channels (Department, Course, General Announce) and direct peer-to-peer chat.
- **Executive Analytics Dashboards**: Interactive Chart.js / Recharts metrics for enrollment trends, fee collection status, grade distribution, and department resource utilization.
- **Security & Audit Center**: Comprehensive audit logs tracking user IP addresses, active JWT sessions, failed login attempts, and password reset workflows.
- **Accessibility & Multi-Language (i18n)**:
  - Language support: English, Spanish, French, Hindi, German, and Arabic.
  - Accessibility controls: Adjustable font scaling (Normal, Large, XL), high-contrast UI mode, and screen-reader compliant aria-labels.
  - Theme Engine: Instant toggle between Dark Mode and Light Mode.

---

## 🏗️ Tech Stack Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend API Gateway**: Express.js, Node.js (CommonJS bundled via `esbuild`)
- **Database**: MongoDB Atlas / Mongoose ORM
- **AI Engine**: Google Gemini API (`@google/genai` SDK)
- **Containerization**: Docker, Multi-stage builds, Nginx Reverse Proxy
- **CI/CD**: GitHub Actions pipeline (`.github/workflows/ci-cd.yml`)

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (Optional)

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/smart-campus-erp.git
cd smart-campus-erp

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Run development server
npm run dev
```

### Building for Production
```bash
# Build bundled server and static distribution
npm run build

# Start production server
npm run start
```

---

## 🐳 Running with Docker

```bash
# Build Docker image
docker build -t smart-campus-erp:latest .

# Run container on port 3000
docker run -d -p 3000:3000 --env-file .env smart-campus-erp:latest
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
