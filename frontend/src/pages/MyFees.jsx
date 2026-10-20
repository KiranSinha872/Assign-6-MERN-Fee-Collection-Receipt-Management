
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const BASE_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";

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
                const headers = { Authorization: `Bearer ${token}` };

                const feesRes = await fetch(`${BASE_URL}/fees`, { headers });
                const feesData = await feesRes.json();
                if (!feesRes.ok) throw new Error(feesData.message || "Failed to load fee structures.");

                const paymentsRes = await fetch(`${BASE_URL}/payments/my`, { headers });
                const paymentsData = await paymentsRes.json();
                if (!paymentsRes.ok) throw new Error(paymentsData.message || "Failed to load payments.");

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

    // Compute summary from fee structures and payments
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
                    {/* Summary stats */}
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span className="stat-icon">📄</span>
                            <p>Total Payable</p>
                            <h2>{formatCurrency(totalPayable)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">✅</span>
                            <p>Paid</p>
                            <h2>{formatCurrency(paidAmount)}</h2>
                        </article>

                        <article className="stat-card">
                            <span className="stat-icon">⏳</span>
                            <p>Pending</p>
                            <h2>{formatCurrency(pendingAmount)}</h2>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <p>
                            <strong>Status:</strong> {status}
                            {overdue && (
                                <span style={{ color: "#d62845", marginLeft: "8px" }}>
                                    ⚠️ Overdue — please pay your pending fees.
                                </span>
                            )}
                        </p>
                    </section>

                    {/* Fee structure for the student's course */}
                    <section className="dashboard-section">
                        <div className="section-heading">
                            <span className="section-icon">📋</span>
                            <div>
                                <h2>Fee Structure — {(user && user.course) || ""}</h2>
                                <p>All fee heads applicable to your course.</p>
                            </div>
                        </div>

                        {feeStructures.length === 0 ? (
                            <p className="empty-state">
                                No fee structures found for your course.
                            </p>
                        ) : (
                            <div className="request-list">
                                {feeStructures.map((fs) => (
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
                                <p>{payments.length} payment(s) found.</p>
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
