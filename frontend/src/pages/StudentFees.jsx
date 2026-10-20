
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function StudentFees({ user }) {
    const { id } = useParams();

    const [summary, setSummary] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const summaryRes = await fetch(`${BASE_URL}/payments/students/${id}/fees`, { headers });
                const summaryData = await summaryRes.json();
                if (!summaryRes.ok) throw new Error(summaryData.message || "Failed to load fee summary.");

                const paymentsRes = await fetch(`${BASE_URL}/payments/student/${id}`, { headers });
                const paymentsData = await paymentsRes.json();
                if (!paymentsRes.ok) throw new Error(paymentsData.message || "Failed to load payments.");

                setSummary(summaryData);
                setPayments(paymentsData.payments || []);
            } catch (err) {
                setError(err.message || "Failed to load student fee data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    return (
        <DashboardLayout title="Student Fee Summary" user={user}>
            {loading && <p>Loading fee summary...</p>}

            {error && (
                <p className="auth-message error" role="status">
                    {error}
                </p>
            )}

            {!loading && !error && summary && (
                <>
                    {/* Student info */}
                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">🎓</span>
                            <div>
                                <h2>{summary.student.name}</h2>
                                <p>
                                    Roll: {summary.student.rollNumber} &nbsp;|&nbsp;
                                    Course: {summary.student.course}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Fee summary stats */}
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span className="stat-icon">📄</span>
                            <p>Total Payable</p>
                            <h2>{formatCurrency(summary.summary.totalPayable)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">✅</span>
                            <p>Paid</p>
                            <h2>{formatCurrency(summary.summary.paidAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⏳</span>
                            <p>Pending</p>
                            <h2>{formatCurrency(summary.summary.pendingAmount)}</h2>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <p>
                            <strong>Status:</strong> {summary.summary.status}
                            {summary.summary.overdue && (
                                <span style={{ color: "#d62845", marginLeft: "8px" }}>
                                    ⚠️ Overdue
                                </span>
                            )}
                        </p>
                    </section>

                    {/* Fee structures for the course */}
                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">📋</span>
                            <div>
                                <h2>Fee Structure — {summary.student.course}</h2>
                                <p>All fee heads for this course.</p>
                            </div>
                        </div>

                        {summary.feeStructures.length === 0 ? (
                            <p className="empty-state">No fee structures found for this course.</p>
                        ) : (
                            <div className="request-list">
                                {summary.feeStructures.map((fs) => (
                                    <article className="request-card" key={fs._id}>
                                        <div className="request-card-heading">
                                            <div>
                                                <h3>{fs.feeHead}</h3>
                                                <p className="request-id">
                                                    Due: {new Date(fs.dueDate).toLocaleDateString("en-IN")}
                                                </p>
                                            </div>
                                            <span className="amount-badge">
                                                {formatCurrency(fs.amount)}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Payment history */}
                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">🧾</span>
                            <div>
                                <h2>Payment History</h2>
                                <p>{payments.length} payment(s) recorded.</p>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <p className="empty-state">No payments recorded yet.</p>
                        ) : (
                            <div className="request-list">
                                {payments.map((p) => (
                                    <article className="request-card" key={p._id}>
                                        <div className="request-card-heading">
                                            <div>
                                                <h3>{p.receiptNo}</h3>
                                                <p className="request-id">
                                                    {(p.feeStructure && p.feeStructure.feeHead) || ""} &nbsp;|&nbsp;
                                                    {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                                                </p>
                                            </div>
                                            <span className="amount-badge">
                                                {formatCurrency(p.amount)}
                                            </span>
                                        </div>

                                        <div className="request-details">
                                            <p><strong>Mode:</strong> {p.paymentMode}</p>
                                            {p.transactionRef && (
                                                 <p><strong>Ref:</strong> {p.transactionRef}</p>
                                            )}
                                            <p><strong>Recorded by:</strong> {(p.recordedBy && p.recordedBy.name) || ""}</p>
                                        </div>

                                        <div className="status-controls">
                                            <Link
                                                to={`/receipts/${p.receiptNo}`}
                                                className="secondary-btn"
                                            >
                                                View Receipt
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
