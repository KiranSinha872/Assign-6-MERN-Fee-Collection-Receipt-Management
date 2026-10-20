
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginRegister from "./components/LoginRegister";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import "./App.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Home() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (token && user) {
    return (
      <Navigate
        to={user.role === "Admin" ? "/admin" : "/user"}
        replace
      />
    );
  }

  return <LoginRegister />;
}

function ProtectedRoute({ requiredRole, children }) {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== requiredRole) {
    return (
      <Navigate
        to={user.role === "Admin" ? "/admin" : "/user"}
        replace
      />
    );
  }

  return children;
}

function AccessDenied() {
  return (
    <DashboardLayout title="Page Not Found">
      <section className="dashboard-section">
        <h2>Page not found</h2>
        <p>The page you requested does not exist.</p>
      </section>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="Donor">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
}
