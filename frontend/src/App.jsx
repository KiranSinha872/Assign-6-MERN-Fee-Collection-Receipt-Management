import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginRegister from "./components/LoginRegister";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

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
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return (
            <Navigate
                to={user.role === "Admin" ? "/admin" : "/user"}
                replace
            />
        );
    }

    return children;
}

export default function App() {
    const [user, setUser] = useState(getStoredUser);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate
                            to={user.role === "Admin" ? "/admin" : "/user"}
                            replace
                        />
                    ) : (
                        <LoginRegister onLogin={handleLogin} />
                    )
                }
            />
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate
                            to={user.role === "Admin" ? "/admin" : "/user"}
                            replace
                        />
                    ) : (
                        <LoginRegister onLogin={handleLogin} initialMode="login" />
                    )
                }
            />
            <Route
                path="/register"
                element={
                    user ? (
                        <Navigate
                            to={user.role === "Admin" ? "/admin" : "/user"}
                            replace
                        />
                    ) : (
                        <LoginRegister onLogin={handleLogin} initialMode="register" />
                    )
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="Admin" user={user}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={<Navigate to="/admin" replace />}
            />

            <Route
                path="/user"
                element={
                    <ProtectedRoute requiredRole="Student" user={user}>
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-fees"
                element={<Navigate to="/user" replace />}
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to={user ? (user.role === "Admin" ? "/admin" : "/user") : "/login"}
                        replace
                    />
                }
            />
        </Routes>
    );
}
