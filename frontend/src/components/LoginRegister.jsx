import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";

export default function LoginRegister({ onLogin, initialMode = "login" }) {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(initialMode !== "register");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        rollNumber: "",
        course: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const switchMode = (loginMode) => {
        setIsLogin(loginMode);
        setMessage("");
        setError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError(false);
        setLoading(true);

        try {
            if (isLogin) {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: form.email.trim().toLowerCase(),
                        password: form.password
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Login failed");

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                if (onLogin) onLogin(data.user);

                navigate(data.user.role === "Admin" ? "/admin" : "/user", {
                    replace: true
                });
            } else {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        email: form.email.trim().toLowerCase(),
                        password: form.password,
                        phone: form.phone.trim(),
                        rollNumber: form.rollNumber.trim().toUpperCase(),
                        course: form.course
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Registration failed");

                setMessage(data.message || "Account created successfully! Please log in.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(true);
            setMessage(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "14px",
        boxSizing: "border-box"
    };

    const fieldStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "12px",
        textAlign: "left"
    };

    const labelStyle = {
        fontSize: "13px",
        fontWeight: "bold",
        color: "#444"
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f4f6f8",
                fontFamily: "Arial, sans-serif",
                padding: "20px"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "30px 24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    textAlign: "center"
                }}
            >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🧾</div>
                <h1 style={{ margin: "0 0 6px 0", fontSize: "22px", color: "#222" }}>
                    FeeDesk
                </h1>
                <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#666" }}>
                    {isLogin ? "Sign in to your account" : "Register a new student account"}
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "20px"
                    }}
                >
                    <button
                        type="button"
                        onClick={() => switchMode(true)}
                        style={{
                            flex: 1,
                            padding: "8px",
                            border: "1px solid #007bff",
                            backgroundColor: isLogin ? "#007bff" : "#ffffff",
                            color: isLogin ? "#ffffff" : "#007bff",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode(false)}
                        style={{
                            flex: 1,
                            padding: "8px",
                            border: "1px solid #007bff",
                            backgroundColor: !isLogin ? "#007bff" : "#ffffff",
                            color: !isLogin ? "#ffffff" : "#007bff",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div style={fieldStyle}>
                                <label htmlFor="name" style={labelStyle}>Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="phone" style={labelStyle}>Phone Number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="rollNumber" style={labelStyle}>Roll Number</label>
                                <input
                                    id="rollNumber"
                                    name="rollNumber"
                                    value={form.rollNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. CS2401"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="course" style={labelStyle}>Course</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={form.course}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select course</option>
                                    <option value="B.Tech CSE">B.Tech CSE</option>
                                    <option value="B.Tech ECE">B.Tech ECE</option>
                                    <option value="B.Tech ME">B.Tech ME</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div style={fieldStyle}>
                        <label htmlFor="email" style={labelStyle}>Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {message && (
                        <div
                            role="status"
                            style={{
                                padding: "8px 12px",
                                marginBottom: "15px",
                                borderRadius: "4px",
                                fontSize: "13px",
                                textAlign: "left",
                                backgroundColor: error ? "#f8d7da" : "#d4edda",
                                color: error ? "#721c24" : "#155724",
                                border: `1px solid ${error ? "#f5c6cb" : "#c3e6cb"}`
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#007bff",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "15px",
                            fontWeight: "bold",
                            marginTop: "8px"
                        }}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                            ? "Login to Account"
                            : "Create Account"}
                    </button>
                </form>

                <p style={{ marginTop: "16px", fontSize: "13px", color: "#666" }}>
                    {isLogin ? "New student? " : "Already registered? "}
                    <button
                        type="button"
                        onClick={() => switchMode(!isLogin)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#007bff",
                            cursor: "pointer",
                            fontWeight: "bold",
                            padding: 0,
                            textDecoration: "underline"
                        }}
                    >
                        {isLogin ? "Register here" : "Login here"}
                    </button>
                </p>
            </div>
        </div>
    );
}
