
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://bloodbank-4yqt.onrender.com/api/auth";

export default function LoginRegister() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    dateOfBirth: "",
    city: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
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
        const response = await axios.post(`${API_URL}/login`, {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate(user.role === "Admin" ? "/admin" : "/user", {
          replace: true,
        });
      } else {
        const response = await axios.post(`${API_URL}/register`, {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          bloodGroup: form.bloodGroup,
          dateOfBirth: form.dateOfBirth,
          city: form.city.trim(),
        });

        setMessage(response.data.message || "Registration successful!");
        setError(false);
        setIsLogin(true);

        setForm((previous) => ({
          ...previous,
          password: "",
        }));
      }
    } catch (err) {
      setError(true);
      setMessage(
        err.response?.data?.message ||
          "Server se connection nahi ho pa raha. Backend check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🩸</div>

        <h1>LifeFlow</h1>
        <p className="auth-subtitle">
          Blood Bank Management System
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
                  placeholder="Enter your full name"
                  minLength={2}
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
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="bloodGroup">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
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
              placeholder="Enter your email"
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
              placeholder="Minimum 8 characters"
              minLength={8}
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
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
          {isLogin
            ? "New to LifeFlow? "
            : "Already have an account? "}
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
