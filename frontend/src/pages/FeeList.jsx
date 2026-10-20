
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = `${import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api"}/fees`;

export default function FeeList({ user }) {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();
    const courseFilter = searchParams.get("course") || "";

    useEffect(() => {
        const loadFees = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load fee structures.");
                setFees(data.feeStructures || []);
            } catch (err) {
                setError(err.message || "Failed to load fee structures.");
            } finally {
                setLoading(false);
            }
        };

        loadFees();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this fee structure?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete fee structure.");
            setMessage("Fee structure deleted successfully.");
            setFees((previous) => previous.filter((f) => f._id !== id));
        } catch (err) {
            setMessage(err.message || "Failed to delete fee structure.");
        }
    };

    const filteredFees = courseFilter
        ? fees.filter((f) =>
              f.course.toLowerCase().includes(courseFilter.toLowerCase())
          )
        : fees;

    return (
        <DashboardLayout title="Fee Structures" user={user}>
            {message && (
                <div className="dashboard-message" role="status">
                    {message}
                </div>
            )}

            <section className="dashboard-section">
                <div className="section-heading">
                    <span className="section-icon">📋</span>
                    <div>
                        <h2>Manage Fee Structures</h2>
                        <p>Create and manage fee entries per course.</p>
                    </div>
                </div>

                <div className="filter-form">
                    <div className="form-field">
                        <label htmlFor="courseFilter">Filter by Course</label>
                        <input
                            id="courseFilter"
                            value={courseFilter}
                            onChange={(e) =>
                                setSearchParams(
                                    e.target.value
                                        ? { course: e.target.value }
                                        : {}
                                )
                            }
                            placeholder="e.g. B.Tech CSE"
                        />
                    </div>

                    <Link to="/admin/fees/new" className="submit-btn">
                        + Add Fee Structure
                    </Link>
                </div>
            </section>

            <section className="dashboard-section">
                {loading && <p>Loading fee structures...</p>}

                {error && (
                    <p className="auth-message error" role="status">
                        {error}
                    </p>
                )}

                {!loading && !error && filteredFees.length === 0 && (
                    <p className="empty-state">No fee structures found.</p>
                )}

                {!loading && !error && filteredFees.length > 0 && (
                    <div className="request-list">
                        {filteredFees.map((fee) => (
                            <article className="request-card" key={fee._id}>
                                <div className="request-card-heading">
                                    <div>
                                        <h3>{fee.feeHead}</h3>
                                        <p className="request-id">Course: {fee.course}</p>
                                    </div>
                                    <span className="amount-badge">₹{fee.amount.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="request-details">
                                    <p>
                                        <strong>Due Date:</strong>{" "}
                                        {new Date(fee.dueDate).toLocaleDateString("en-IN")}
                                    </p>
                                    <p>
                                        <strong>Created by:</strong>{" "}
                                        {(fee.createdBy && fee.createdBy.name) || "Admin"}
                                    </p>
                                </div>

                                <div className="status-controls">
                                    <Link
                                        to={`/admin/fees/${fee._id}/edit`}
                                        className="secondary-btn"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        className="logout-btn"
                                        onClick={() => handleDelete(fee._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
}
