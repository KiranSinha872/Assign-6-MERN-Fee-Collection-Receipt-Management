import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getStudentFeeSummaryApi, getStudentPaymentsApi } from "../api/feeApi";

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
                const summaryData = await getStudentFeeSummaryApi(token, id);
                const paymentsData = await getStudentPaymentsApi(token, id);

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

                    <section className="stats-grid">
                        <article className="stat-card">
                            <span className="stat-icon">💵</span>
                            <p>Total Payable</p>
                            <h2>{formatCurrency(summary.summary.totalPayable)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">✅</span>
                            <p>Total Paid</p>
                            <h2>{formatCurrency(summary.summary.paidAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⏳</span>
                            <p>Pending Amount</p>
                            <h2>{formatCurrency(summary.summary.pendingAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">📌</span>
                            <p>Status</p>
                            <h2>{summary.summary.status}</h2>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">📚</span>
                            <div>
                                <h2>Applicable Fee Heads</h2>
                                <p>Fee structure for {summary.student.course}.</p>
                            </div>
                        </div>

                        {summary.feeStructures.length === 0 ? (
                            <p className="empty-state">No fee structure found for this course.</p>
                        ) : (
                            <div className="request-list">
                                {summary.feeStructures.map((fs) => (
                                    <article className="request-card" key={fs._id}>
                                        <div className="request-card-heading">
                                            <h3>{fs.feeHead}</h3>
                                            <span className="amount-badge">
                                                {formatCurrency(fs.amount)}
                                            </span>
                                        </div>

                                        <p>
                                            Due Date:{" "}
                                            {fs.dueDate
                                                ? new Date(fs.dueDate).toLocaleDateString("en-IN")
                                                : "N/A"}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">🧾</span>
                            <div>
                                <h2>Payment History</h2>
                                <p>{payments.length} payment(s) recorded.</p>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <p className="empty-state">No payments recorded yet for this student.</p>
                        ) : (
                            <div className="request-list">
                                {payments.map((p) => (
                                    <article className="request-card" key={p._id}>
                                        <div className="request-card-heading">
                                            <div>
                                                <h3>Receipt: {p.receiptNo}</h3>
                                                <p className="request-id">
                                                    Head: {p.feeStructure?.feeHead || "Fee"} | Mode: {p.paymentMode}
                                                </p>
                                            </div>

                                            <span className="amount-badge">
                                                {formatCurrency(p.amount)}
                                            </span>
                                        </div>

                                        <div className="request-details">
                                            <p>
                                                <strong>Date:</strong>{" "}
                                                {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                                            </p>
                                            {p.transactionRef && (
                                                <p>
                                                    <strong>Ref:</strong> {p.transactionRef}
                                                </p>
                                            )}
                                        </div>

                                        <div className="status-controls">
                                            <Link
                                                to={`/receipts/${p.receiptNo}`}
                                                className="edit-btn"
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
