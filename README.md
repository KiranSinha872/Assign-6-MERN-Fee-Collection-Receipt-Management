# Assign-6-MERN-Fee-Collection-Receipt-Management

> **PS3: Fee Collection & Receipt Management System**  
> Built for educational institutes to manage course fee structures, collect partial & full payments, enforce financial validation rules, issue auto-generated sequential receipts, and track dues through comprehensive dashboards.

---

## 📋 Problem Statement Overview

- **Domain**: Education / Finance
- **Roles**:
  - **Admin / Accountant**: Manage fee heads per course, record student payments, view collection metrics, and monitor defaulters.
  - **Student**: View applicable fee structures for enrolled course, track total payable, total paid, pending balances, and access printable receipts.
- **Linked Collections**:
  - `User`: Roles (`Admin`, `Student`), credentials, student metadata (`rollNumber`, `course`).
  - `FeeStructure`: Course-specific fee heads (`Tuition`, `Exam`, `Library`, etc.), amount, due date.
  - `Payment`: Recorded payments with auto-generated receipt number, payment mode (`Cash`, `UPI`, `Card`, `NetBanking`), date, and transaction reference.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router v7, Vite, Vanilla CSS (with print media styles)
- **Backend**: Node.js, Express.js (REST API, JWT Authentication, Custom Middleware)
- **Database**: MongoDB with Mongoose ODM
- **Security**: Passwords hashed with `bcryptjs`, protected routes with JWT (`authMiddleware`, `adminMiddleware`)

---

## ✨ Key Features

1. **Role-Based Authentication**:
   - Secure login & registration for Admin and Students.
   - Enforces roll number and course assignment for students.
2. **Fee Structure Management (Admin CRUD)**:
   - Create, read, update, and delete fee structures per course with due dates and amounts.
   - Course filtering support.
3. **Payment Recording & Business Rule Enforcement**:
   - Record payments against individual students and fee heads.
   - **Enforced Business Rule**: Rejects payments of ₹0 or negative amounts.
   - **Enforced Business Rule**: Strictly rejects payments greater than the student's remaining pending balance.
   - Supports partial payments with dynamic recalculation of balances.
4. **Automated Sequential Receipt Generation**:
   - Unique, atomic receipt numbers in the format `RCP-YYYY-XXXX` (e.g., `RCP-2026-0001`).
   - Dedicated receipt view page with student details, transaction reference, fee head, and date.
   - Built-in **Print Receipt** functionality with custom `@media print` stylesheets.
5. **Admin Analytics Dashboard**:
   - **Total Collected** and **Total Pending** across all enrolled students.
   - **Payment Mode Breakdown** (Cash, UPI, Card, NetBanking).
   - **Overdue Defaulters List**: Students with pending dues whose course fee structures have passed their due dates.
6. **Student Portal (My Fees)**:
   - Real-time summary cards: Total Payable, Total Paid, and Balance Pending.
   - Overdue alert notice if payments are overdue.
   - Breakdown of all fee heads for the student's enrolled course.
   - Complete payment history with one-click links to view and print official receipts.
7. **Student Directory & Individual Ledgers**:
   - Admin view of all enrolled students with search and course filtering.
   - Detailed ledger per student showing their course fee items, payments made, and pending balance.

---

## 📁 Project Structure

```
FeeCollection&ReceiptManagementSystem/
├── backend/
│   ├── Config/
│   │   └── db.js                  # MongoDB Atlas connection with error handling
│   ├── Controllers/
│   │   ├── authController.js       # Register, login, current user & profile
│   │   ├── feeController.js        # Fee structure CRUD
│   │   ├── paymentController.js    # Record payment, receipts, receipt number generator
│   │   ├── studentController.js    # Student listings and fee calculations
│   │   └── dashboardController.js  # Overall metrics, defaulters & mode-wise collection
│   ├── Middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── adminMiddleware.js      # Admin role enforcement
│   ├── Models/
│   │   ├── User.js                 # User schema (Admin / Student)
│   │   ├── FeeStructure.js         # Fee structure schema
│   │   ├── Payment.js              # Payment transactions schema
│   │   └── Counter.js              # Atomic sequence counter for receipts
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── studentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seed.js                     # Sample database seed script
│   ├── server.js                   # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js          # Auth requests
│   │   │   ├── feeApi.js           # Fee structure endpoints
│   │   │   ├── paymentApi.js       # Payments & receipts endpoints
│   │   │   └── dashboardApi.js     # Dashboard metrics & students
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx # Common layout with role-based navigation & header
│   │   │   ├── FeeForm.jsx         # Reusable form component for Fee Structure
│   │   │   └── LoginRegister.jsx   # Authentication form
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Overview metrics, charts & defaulters
│   │   │   ├── FeeList.jsx         # Admin fee structures list
│   │   │   ├── FeeNew.jsx          # Create fee structure
│   │   │   ├── FeeEdit.jsx         # Edit fee structure
│   │   │   ├── RecordPayment.jsx   # Record payment modal/form with validation
│   │   │   ├── StudentList.jsx     # Directory of students
│   │   │   ├── StudentFees.jsx     # Admin ledger view for single student
│   │   │   ├── MyFees.jsx          # Student fee summary & receipts
│   │   │   └── ReceiptPage.jsx     # Printable receipt page
│   │   ├── App.css                 # Comprehensive styling + print CSS
│   │   ├── App.jsx                 # Route definitions and auth state
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/feedesk?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

### 3. Seed Sample Data (Optional but Recommended)
Populates sample courses, fee structures, students, and recorded payments:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# or: npm start
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5002/api
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials (from Seed Script)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@feedesk.com` | `admin@1234` | Full access to Fee CRUD, payments, defaulters |
| **Student** | `aryan@student.com` | `student@1234` | B.Tech CSE (Partially Paid) |
| **Student** | `priya@student.com` | `student@1234` | B.Tech CSE (Fully Paid) |
| **Student** | `rohan@student.com` | `student@1234` | B.Tech CSE (Unpaid / Overdue) |
| **Student** | `sneha@student.com` | `student@1234` | B.Tech ECE |

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (Student or Admin) |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile information |

### Fee Structures (`/api/fees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/fees` | Authenticated | List all fee structures (optional `?course=`) |
| `GET` | `/api/fees/:id` | Authenticated | Get single fee structure by ID |
| `POST` | `/api/fees` | Admin | Create new fee structure |
| `PUT` | `/api/fees/:id` | Admin | Update fee structure |
| `DELETE`| `/api/fees/:id` | Admin | Remove fee structure |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Admin | Record payment (validates amount <= pending) |
| `GET` | `/api/payments/my` | Student | Get payment history for authenticated student |
| `GET` | `/api/payments/receipt/:receiptNo` | Authenticated | Fetch full receipt details by receipt number |
| `GET` | `/api/payments/student/:studentId` | Admin | Get payments recorded for a specific student |

### Students & Ledgers (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Admin | List all students with computed balances |
| `GET` | `/api/students/:id/fees` | Admin | Get complete fee breakdown for a student |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Admin | Summary totals, mode distribution & defaulters |
| `GET` | `/api/dashboard/student-summary` | Student | Current student's total payable, paid & pending |
