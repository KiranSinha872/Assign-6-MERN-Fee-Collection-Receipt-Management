
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api"}/payments/receipt`;

export default function ReceiptPage() {
    const { receiptNo } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReceipt = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/${receiptNo}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load receipt.");
                setPayment(data.payment);
            } catch (err) {
                setError(err.message || "Failed to load receipt.");
            } finally {
                setLoading(false);
            }
        };

        loadReceipt();
    }, [receiptNo]);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    if (loading) {
        return (
            <div className="receipt-page">
                <p>Loading receipt...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="receipt-page">
                <p className="auth-message error" role="status">
                    {error}
                </p>
                <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const student = (payment && payment.student) || {};
    const feeStructure = (payment && payment.feeStructure) || {};
    const recordedBy = (payment && payment.recordedBy) || {};

    return (
        <div className="receipt-page">
            <div className="receipt-card">
                {/* Header */}
                <div className="receipt-header">
                    <div className="receipt-brand">🧾 FeeDesk</div>
                    <div className="receipt-title">Payment Receipt</div>
                </div>

                <div className="receipt-no">
                    Receipt No: <strong>{payment.receiptNo}</strong>
                </div>

                <hr className="receipt-divider" />

                {/* Student info */}
                <div className="receipt-section">
                    <h3>Student Details</h3>
                    <div className="receipt-row">
                        <span>Name</span>
                        <span>{student.name}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Roll Number</span>
                        <span>{student.rollNumber}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Course</span>
                        <span>{student.course}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Email</span>
                        <span>{student.email}</span>
                    </div>
                </div>

                <hr className="receipt-divider" />

                {/* Payment info */}
                <div className="receipt-section">
                    <h3>Payment Details</h3>
                    <div className="receipt-row">
                        <span>Fee Head</span>
                        <span>{feeStructure.feeHead}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Course</span>
                        <span>{feeStructure.course}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Amount Paid</span>
                        <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Payment Mode</span>
                        <span>{payment.paymentMode}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Payment Date</span>
                        <span>
                            {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                        </span>
                    </div>
                    {payment.transactionRef && (
                        <div className="receipt-row">
                            <span>Transaction Ref</span>
                            <span>{payment.transactionRef}</span>
                        </div>
                    )}
                    <div className="receipt-row">
                        <span>Recorded By</span>
                        <span>{recordedBy.name}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Recorded On</span>
                        <span>
                            {new Date(payment.createdAt).toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>

                <hr className="receipt-divider" />

                {/* Total */}
                <div className="receipt-total">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(payment.amount)}</span>
                </div>

                <p className="receipt-note">
                    This is a computer-generated receipt and does not require a
                    physical signature.
                </p>

                {/* Actions — hidden during print */}
                <div className="receipt-actions no-print">
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={() => window.print()}
                    >
                        🖨️ Print Receipt
                    </button>

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
