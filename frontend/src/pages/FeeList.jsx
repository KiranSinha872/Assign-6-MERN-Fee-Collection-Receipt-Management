import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getFeesApi, deleteFeeApi } from "../api/feeApi";

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
                const data = await getFeesApi(token);
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
            await deleteFeeApi(token, id);
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
                    <span className="section-icon">📚</span>
                    <div>
                        <h2>Manage Fee Structures</h2>
                        <p>Configure fee heads and amounts per course.</p>
                    </div>
                </div>

                <div className="filter-form">
                    <div className="form-field">
                        <label htmlFor="courseFilter">Filter by Course</label>
                        <select
                            id="courseFilter"
                            value={courseFilter}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setSearchParams({ course: e.target.value });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                        >
                            <option value="">All courses</option>
                            <option value="B.Tech CSE">B.Tech CSE</option>
                            <option value="B.Tech ECE">B.Tech ECE</option>
                            <option value="B.Tech ME">B.Tech ME</option>
                        </select>
                    </div>

                    <Link to="/admin/fees/new" className="submit-btn">
                        + Add Fee Structure
                    </Link>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <span className="section-icon">📑</span>
                    <div>
                        <h2>Fee Heads</h2>
                        <p>{filteredFees.length} fee structure(s) found.</p>
                    </div>
                </div>

                {loading ? (
                    <p>Loading fee structures...</p>
                ) : error ? (
                    <p className="auth-message error">{error}</p>
                ) : filteredFees.length === 0 ? (
                    <p className="empty-state">No fee structures found.</p>
                ) : (
                    <div className="request-list">
                        {filteredFees.map((fee) => (
                            <article className="request-card" key={fee._id}>
                                <div className="request-card-heading">
                                    <div>
                                        <h3>{fee.course}</h3>
                                        <p className="request-id">{fee.feeHead}</p>
                                    </div>

                                    <span className="amount-badge">
                                        ₹{Number(fee.amount).toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="request-details">
                                    <p>
                                        <strong>Due Date:</strong>{" "}
                                        {fee.dueDate
                                            ? new Date(fee.dueDate).toLocaleDateString("en-IN")
                                            : "N/A"}
                                    </p>
                                </div>

                                <div className="status-controls">
                                    <Link
                                        to={`/admin/fees/${fee._id}/edit`}
                                        className="edit-btn"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        className="delete-btn"
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
