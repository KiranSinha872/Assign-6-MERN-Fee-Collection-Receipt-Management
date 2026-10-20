import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getFeesApi, getMyPaymentsApi } from "../api/feeApi";

export default function MyFees({ user }) {
    const [feeStructures, setFeeStructures] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                const feesData = await getFeesApi(token);
                const paymentsData = await getMyPaymentsApi(token);

                setFeeStructures(feesData.feeStructures || []);
                setPayments(paymentsData.payments || []);
            } catch (err) {
                setError(err.message || "Failed to load fee data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const totalPayable = feeStructures.reduce((sum, fs) => sum + fs.amount, 0);
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalPayable - paidAmount;

    let status = "Unpaid";
    if (paidAmount >= totalPayable && totalPayable > 0) {
        status = "Paid";
    } else if (paidAmount > 0) {
        status = "Partially Paid";
    }

    const today = new Date();
    const overdue =
        pendingAmount > 0 &&
        feeStructures.some((fs) => new Date(fs.dueDate) < today);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    return (
        <DashboardLayout title="My Fees" user={user}>
            {loading && <p>Loading your fee details...</p>}

            {error && (
                <p className="auth-message error" role="status">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span className="stat-icon">💵</span>
                            <p>Total Payable</p>
                            <h2>{formatCurrency(totalPayable)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">✅</span>
                            <p>Total Paid</p>
                            <h2>{formatCurrency(paidAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⏳</span>
                            <p>Pending Balance</p>
                            <h2>{formatCurrency(pendingAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">
                                {status === "Paid" ? "🎉" : overdue ? "⚠️" : "📌"}
                            </span>
                            <p>Fee Status</p>
                            <h2>{status}</h2>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">📚</span>
                            <div>
                                <h2>Applicable Fee Heads</h2>
                                <p>Fee breakdown for enrolled course.</p>
                            </div>
                        </div>

                        {feeStructures.length === 0 ? (
                            <p className="empty-state">No fee structure found for your course.</p>
                        ) : (
                            <div className="request-list">
                                {feeStructures.map((fs) => (
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
                                <h2>My Payment History</h2>
                                <p>{payments.length} payment(s) made.</p>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <p className="empty-state">No payments made yet.</p>
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
