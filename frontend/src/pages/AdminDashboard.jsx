
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function AdminDashboard({ user }) {
    const [data, setData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers });
                const dashData = await dashRes.json();
                if (!dashRes.ok) throw new Error(dashData.message || "Failed to load dashboard data.");

                const stuRes = await fetch(`${BASE_URL}/payments/students`, { headers });
                const stuData = await stuRes.json();
                if (!stuRes.ok) throw new Error(stuData.message || "Failed to load students.");

                setData(dashData);
                setStudents(stuData.students || []);
            } catch (err) {
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    const overdueDefaulters = (data && data.overdueDefaulters) || [];
    const modeWiseCollection = (data && data.modeWiseCollection) || {};

    return (
        <DashboardLayout title="Admin Dashboard" user={user}>
            {loading && <p>Loading dashboard...</p>}

            {error && (
                <div className="dashboard-message" role="status">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span className="stat-icon">💰</span>
                            <p>Total Collected</p>
                            <h2>{formatCurrency(data.totalCollected)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⏳</span>
                            <p>Total Pending</p>
                            <h2>{formatCurrency(data.totalPending)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⚠️</span>
                            <p>Overdue Defaulters</p>
                            <h2>{overdueDefaulters.length}</h2>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">📊</span>
                            <div>
                                <h2>Mode-wise Collection</h2>
                                <p>Breakdown by payment mode.</p>
                            </div>
                        </div>

                        <div className="stats-grid">
                            {["Cash", "UPI", "Card"].map((mode) => (
                                <article className="stat-card" key={mode}>
                                    <span className="stat-icon">
                                        {mode === "Cash" ? "💵" : mode === "UPI" ? "📱" : "💳"}
                                    </span>
                                    <p>{mode}</p>
                                    <h2>
                                        {formatCurrency(modeWiseCollection[mode] || 0)}
                                    </h2>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">🚨</span>
                            <div>
                                <h2>Overdue Defaulters</h2>
                                <p>Students with pending fees past due date.</p>
                            </div>
                        </div>

                        {overdueDefaulters.length === 0 ? (
                            <p className="empty-state">No overdue defaulters. All caught up!</p>
                        ) : (
                            <div className="request-list">
                                {overdueDefaulters.map((item) => (
                                    <article className="request-card" key={item.student.id}>
                                        <div className="request-card-heading">
                                            <div>
                                                <h3>{item.student.name}</h3>
                                                <p className="request-id">
                                                    Roll: {item.student.rollNumber} | Course: {item.student.course}
                                                </p>
                                            </div>
                                            <span className="amount-badge">
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="request-details">
                                            <p>
                                                <strong>Pending:</strong>{" "}
                                                {formatCurrency(item.pendingAmount)}
                                            </p>
                                            <p>
                                                <strong>Email:</strong> {item.student.email}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">🎓</span>
                            <div>
                                <h2>Students</h2>
                                <p>{students.length} student(s) registered.</p>
                            </div>
                        </div>

                        {students.length === 0 ? (
                            <p className="empty-state">No students found.</p>
                        ) : (
                            <div className="request-list">
                                {students.map((student) => (
                                    <article className="request-card" key={student._id}>
                                        <div className="request-card-heading">
                                            <div>
                                                <h3>{student.name}</h3>
                                                <p className="request-id">
                                                    Roll: {student.rollNumber} | Course: {student.course}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="request-details">
                                            <p><strong>Email:</strong> {student.email}</p>
                                            <p><strong>Phone:</strong> {student.phone}</p>
                                        </div>

                                        <div className="status-controls">
                                            <Link
                                                to={`/admin/students/${student._id}/fees`}
                                                className="submit-btn"
                                            >
                                                View Fees
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </DashboardLayout>
    );
}
