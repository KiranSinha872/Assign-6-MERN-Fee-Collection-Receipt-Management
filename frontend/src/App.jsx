
import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import LoginRegister from "./components/LoginRegister";
import DashboardLayout from "./components/DashboardLayout";

import AdminDashboard from "./pages/AdminDashboard";
import FeeList from "./pages/FeeList";
import FeeNew from "./pages/FeeNew";
import FeeEdit from "./pages/FeeEdit";
import RecordPayment from "./pages/RecordPayment";
import StudentFees from "./pages/StudentFees";

import MyFees from "./pages/MyFees";
import ReceiptPage from "./pages/ReceiptPage";

import "./App.css";

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

function ProtectedRoute({ requiredRole, user, children }) {
    const token = localStorage.getItem("token");

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== requiredRole) {
        return (
            <Navigate
                to={user.role === "Admin" ? "/admin/dashboard" : "/my-fees"}
                replace
            />
        );
    }

    return children;
}

function NotFound({ user }) {
    return (
        <DashboardLayout title="Page Not Found" user={user}>
            <section className="dashboard-section">
                <h2>Page not found</h2>
                <p>The page you requested does not exist.</p>
            </section>
        </DashboardLayout>
    );
}

export default function App() {
    const [user, setUser] = useState(getStoredUser);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route
                    path="/"
                    element={
                        user
                            ? <Navigate
                                to={user.role === "Admin" ? "/admin/dashboard" : "/my-fees"}
                                replace
                              />
                            : <LoginRegister onLogin={handleLogin} />
                    }
                />
                <Route
                    path="/login"
                    element={
                        user
                            ? <Navigate
                                to={user.role === "Admin" ? "/admin/dashboard" : "/my-fees"}
                                replace
                              />
                            : <LoginRegister onLogin={handleLogin} initialMode="login" />
                    }
                />
                <Route
                    path="/register"
                    element={
                        user
                            ? <Navigate
                                to={user.role === "Admin" ? "/admin/dashboard" : "/my-fees"}
                                replace
                              />
                            : <LoginRegister onLogin={handleLogin} initialMode="register" />
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <AdminDashboard user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/fees"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <FeeList user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/fees/new"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <FeeNew user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/fees/:id/edit"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <FeeEdit user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/payments/new"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <RecordPayment user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/students/:id/fees"
                    element={
                        <ProtectedRoute requiredRole="Admin" user={user}>
                            <StudentFees user={user} />
                        </ProtectedRoute>
                    }
                />

                {/* Student routes */}
                <Route
                    path="/my-fees"
                    element={
                        <ProtectedRoute requiredRole="Student" user={user}>
                            <MyFees user={user} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/receipts/:receiptNo"
                    element={
                        user
                            ? <ReceiptPage />
                            : <Navigate to="/" replace />
                    }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound user={user} />} />
            </Routes>
        </BrowserRouter>
    );
}
