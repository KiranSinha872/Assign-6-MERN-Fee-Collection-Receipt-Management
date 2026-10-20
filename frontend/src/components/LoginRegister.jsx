import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/authApi";

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
                const data = await loginApi(
                    form.email.trim().toLowerCase(),
                    form.password
                );

                const { token, user } = data;

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                if (onLogin) onLogin(user);

                navigate(user.role === "Admin" ? "/admin/dashboard" : "/my-fees", {
                    replace: true
                });
            } else {
                const data = await registerApi({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    phone: form.phone.trim(),
                    rollNumber: form.rollNumber.trim(),
                    course: form.course.trim()
                });

                setMessage(data.message || "Registration successful!");
                setError(false);
                setIsLogin(true);

                setForm((previous) => ({
                    ...previous,
                    password: ""
                }));
            }
        } catch (err) {
            setError(true);
            setMessage(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🧾</div>

                <h1>FeeDesk</h1>
                <p className="auth-subtitle">
                    Fee Collection & Receipt Management System
                </p>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={isLogin ? "active" : ""}
                        onClick={() => switchMode(true)}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        className={!isLogin ? "active" : ""}
                        onClick={() => switchMode(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-field">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="rollNumber">Roll Number</label>
                                <input
                                    id="rollNumber"
                                    name="rollNumber"
                                    value={form.rollNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. CS2401"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="course">Course</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={form.course}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select course</option>
                                    <option value="B.Tech CSE">B.Tech CSE</option>
                                    <option value="B.Tech ECE">B.Tech ECE</option>
                                    <option value="B.Tech ME">B.Tech ME</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-field">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                        />
                    </div>

                    {message && (
                        <p
                            className={`auth-message ${error ? "error" : "success"}`}
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                            ? "Login to Account"
                            : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? "New student? " : "Already registered? "}
                    <button
                        type="button"
                        onClick={() => switchMode(!isLogin)}
                    >
                        {isLogin ? "Register here" : "Login here"}
                    </button>
                </p>
            </div>
        </div>
    );
}
