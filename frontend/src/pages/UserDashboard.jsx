import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";

export default function UserDashboard() {
    const [feeStructures, setFeeStructures] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const token = localStorage.getItem("token");

    const getHeaders = useCallback(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }), [token]);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [feeRes, payRes] = await Promise.all([
                fetch(`${API_URL}/fees`, { headers: getHeaders() }),
                fetch(`${API_URL}/payments/my`, { headers: getHeaders() })
            ]);

            const feeData = await feeRes.json();
            const payData = await payRes.json();

            if (!feeRes.ok) throw new Error(feeData.message || "Failed to load fee structures");
            if (!payRes.ok) throw new Error(payData.message || "Failed to load payments");

            setFeeStructures(feeData.feeStructures || []);
            setPayments(payData.payments || []);
        } catch (err) {
            setError(err.message || "Failed to load your fee information.");
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (isMounted) {
                await loadData();
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [loadData]);

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
    const isOverdue =
        pendingAmount > 0 &&
        feeStructures.some((fs) => new Date(fs.dueDate) < today);

    const formatCurrency = (amt) =>
        `₹${Number(amt || 0).toLocaleString("en-IN")}`;

    const cardStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "16px",
        marginBottom: "20px"
    };

    const sectionTitleStyle = {
        margin: "0 0 12px 0",
        fontSize: "18px",
        color: "#222"
    };

    const statBoxStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "14px",
        flex: "1",
        minWidth: "160px",
        textAlign: "center"
    };

    const tableHeaderStyle = {
        backgroundColor: "#f4f6f8",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
        fontSize: "13px",
        fontWeight: "bold",
        color: "#444"
    };

    const tableCellStyle = {
        padding: "10px",
        borderBottom: "1px solid #eee",
        fontSize: "13px",
        color: "#333"
    };

    return (
        <DashboardLayout title="My Fees & Payments">
            {error && (
                <div
                    style={{
                        padding: "10px",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        border: "1px solid #f5c6cb",
                        borderRadius: "4px",
                        marginBottom: "16px"
                    }}
                >
                    {error}
                </div>
            )}

            {isOverdue && (
                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        border: "1px solid #ffeeba",
                        borderRadius: "4px",
                        marginBottom: "16px",
                        fontSize: "14px"
                    }}
                >
                    ⚠️ <strong>Notice:</strong> You have pending fee dues that have crossed the due date. Please clear them as soon as possible.
                </div>
            )}

            {loading ? (
                <p style={{ color: "#666" }}>Loading fee details...</p>
            ) : (
                <>
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "20px"
                        }}
                    >
                        <div style={statBoxStyle}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Total Payable</p>
                            <h2 style={{ margin: 0, fontSize: "20px", color: "#007bff" }}>
                                {formatCurrency(totalPayable)}
                            </h2>
                        </div>
                        <div style={statBoxStyle}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Total Paid</p>
                            <h2 style={{ margin: 0, fontSize: "20px", color: "#28a745" }}>
                                {formatCurrency(paidAmount)}
                            </h2>
                        </div>
                        <div style={statBoxStyle}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Pending Balance</p>
                            <h2 style={{ margin: 0, fontSize: "20px", color: pendingAmount > 0 ? "#dc3545" : "#28a745" }}>
                                {formatCurrency(pendingAmount)}
                            </h2>
                        </div>
                        <div style={statBoxStyle}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Payment Status</p>
                            <h2 style={{ margin: 0, fontSize: "18px", color: status === "Paid" ? "#28a745" : "#856404" }}>
                                {status}
                            </h2>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>Applicable Fee Heads</h3>
                        {feeStructures.length === 0 ? (
                            <p style={{ color: "#666", fontSize: "14px" }}>No fee structures found for your enrolled course.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Fee Head</th>
                                        <th style={tableHeaderStyle}>Course</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeStructures.map((fs) => (
                                        <tr key={fs._id}>
                                            <td style={tableCellStyle}>{fs.feeHead}</td>
                                            <td style={tableCellStyle}>{fs.course}</td>
                                            <td style={tableCellStyle}>{formatCurrency(fs.amount)}</td>
                                            <td style={tableCellStyle}>
                                                {fs.dueDate ? new Date(fs.dueDate).toLocaleDateString("en-IN") : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>Payment History & Receipts</h3>
                        {payments.length === 0 ? (
                            <p style={{ color: "#666", fontSize: "14px" }}>No payments recorded yet.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Receipt No</th>
                                        <th style={tableHeaderStyle}>Fee Head</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Mode</th>
                                        <th style={tableHeaderStyle}>Date</th>
                                        <th style={tableHeaderStyle}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p._id}>
                                            <td style={tableCellStyle}>
                                                <strong>{p.receiptNo}</strong>
                                            </td>
                                            <td style={tableCellStyle}>
                                                {p.feeStructure?.feeHead || "Course Fee"}
                                            </td>
                                            <td style={tableCellStyle}>{formatCurrency(p.amount)}</td>
                                            <td style={tableCellStyle}>{p.paymentMode}</td>
                                            <td style={tableCellStyle}>
                                                {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                                            </td>
                                            <td style={tableCellStyle}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedReceipt(p)}
                                                    style={{
                                                        padding: "4px 10px",
                                                        backgroundColor: "#007bff",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    View Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {selectedReceipt && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                        zIndex: 1000
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            padding: "24px",
                            width: "100%",
                            maxWidth: "480px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            fontFamily: "Arial, sans-serif"
                        }}
                    >
                        <div style={{ textAlign: "center", borderBottom: "1px solid #ddd", paddingBottom: "12px", marginBottom: "16px" }}>
                            <div style={{ fontSize: "28px" }}>🧾</div>
                            <h2 style={{ margin: "4px 0", fontSize: "20px" }}>FeeDesk Payment Receipt</h2>
                            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                                Receipt No: <strong>{selectedReceipt.receiptNo}</strong>
                            </p>
                        </div>

                        <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#333", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Fee Head:</span>
                                <strong>{selectedReceipt.feeStructure?.feeHead || "Fee"}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Amount Paid:</span>
                                <strong style={{ color: "#28a745" }}>{formatCurrency(selectedReceipt.amount)}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Payment Mode:</span>
                                <strong>{selectedReceipt.paymentMode}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Payment Date:</span>
                                <span>{new Date(selectedReceipt.paymentDate).toLocaleDateString("en-IN")}</span>
                            </div>
                            {selectedReceipt.transactionRef && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Transaction Ref:</span>
                                    <span>{selectedReceipt.transactionRef}</span>
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: "11px", color: "#888", textAlign: "center", margin: "12px 0" }}>
                            This is a computer-generated receipt and requires no signature.
                        </p>

                        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                🖨️ Print
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
