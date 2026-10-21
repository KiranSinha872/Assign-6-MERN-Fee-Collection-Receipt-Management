import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";
const FEE_HEADS = ["Tuition", "Exam", "Transport", "Other"];
const PAYMENT_MODES = ["Cash", "UPI", "Card"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const [dashboardData, setDashboardData] = useState(null);
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const [feeForm, setFeeForm] = useState({ course: "", feeHead: "", amount: "", dueDate: "" });
    const [editingFeeId, setEditingFeeId] = useState(null);
    const [courseFilter, setCourseFilter] = useState("");

    const [payStudentId, setPayStudentId] = useState("");
    const [payFeeId, setPayFeeId] = useState("");
    const [payAmount, setPayAmount] = useState("");
    const [payMode, setPayMode] = useState("");
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
    const [payRef, setPayRef] = useState("");
    const [payPending, setPayPending] = useState(null);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const [selectedStudentLedger, setSelectedStudentLedger] = useState(null);

    const token = localStorage.getItem("token");

    const getHeaders = useCallback(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }), [token]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [dashRes, stuRes, feeRes] = await Promise.all([
                fetch(`${API_URL}/dashboard`, { headers: getHeaders() }),
                fetch(`${API_URL}/payments/students`, { headers: getHeaders() }),
                fetch(`${API_URL}/fees`, { headers: getHeaders() })
            ]);

            const dashJson = await dashRes.json();
            const stuJson = await stuRes.json();
            const feeJson = await feeRes.json();

            setDashboardData(dashJson);
            setStudents(stuJson.students || []);
            setFees(feeJson.feeStructures || []);
        } catch (err) {
            setMessage(err.message || "Failed to load admin data");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (isMounted) {
                await loadAll();
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [loadAll]);

    useEffect(() => {
        const fetchPending = async () => {
            if (!payStudentId || !payFeeId) {
                setPayPending(null);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/payments/student/${payStudentId}`, {
                    headers: getHeaders()
                });
                const data = await res.json();
                const paymentsForFee = (data.payments || []).filter(
                    (p) => p.feeStructure && p.feeStructure._id === payFeeId
                );
                const paid = paymentsForFee.reduce((sum, p) => sum + p.amount, 0);
                const targetFee = fees.find((f) => f._id === payFeeId);
                if (targetFee) {
                    setPayPending(targetFee.amount - paid);
                }
            } catch {
                setPayPending(null);
            }
        };
        fetchPending();
    }, [payStudentId, payFeeId, fees, getHeaders]);

    const formatCurrency = (amt) =>
        `₹${Number(amt || 0).toLocaleString("en-IN")}`;

    const handleSaveFee = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsError(false);
        try {
            const url = editingFeeId ? `${API_URL}/fees/${editingFeeId}` : `${API_URL}/fees`;
            const method = editingFeeId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(feeForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save fee structure");

            setMessage(editingFeeId ? "Fee structure updated." : "Fee structure created.");
            setFeeForm({ course: "", feeHead: "", amount: "", dueDate: "" });
            setEditingFeeId(null);

            const updated = await fetch(`${API_URL}/fees`, { headers: getHeaders() });
            const updatedJson = await updated.json();
            setFees(updatedJson.feeStructures || []);
        } catch (err) {
            setMessage(err.message || "Error saving fee structure");
            setIsError(true);
        }
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee structure?")) return;
        setMessage("");
        setIsError(false);
        try {
            const res = await fetch(`${API_URL}/fees/${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete fee");
            setFees((prev) => prev.filter((f) => f._id !== id));
            setMessage("Fee structure deleted.");
        } catch (err) {
            setMessage(err.message || "Error deleting fee");
            setIsError(true);
        }
    };

    const handleEditFeeClick = (fee) => {
        setEditingFeeId(fee._id);
        setFeeForm({
            course: fee.course,
            feeHead: fee.feeHead,
            amount: fee.amount,
            dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : ""
        });
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsError(false);
        setSubmittingPayment(true);
        try {
            const res = await fetch(`${API_URL}/payments`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    studentId: payStudentId,
                    feeStructureId: payFeeId,
                    amount: Number(payAmount),
                    paymentMode: payMode,
                    paymentDate: payDate,
                    transactionRef: payRef
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to record payment");

            setMessage(`Payment recorded! Receipt No: ${data.payment.receiptNo}`);
            setPayStudentId("");
            setPayFeeId("");
            setPayAmount("");
            setPayMode("");
            setPayRef("");
            setPayPending(null);

            loadAll();
        } catch (err) {
            setMessage(err.message || "Error recording payment");
            setIsError(true);
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleViewStudentLedger = async (studentId) => {
        try {
            const [summaryRes, payRes] = await Promise.all([
                fetch(`${API_URL}/payments/students/${studentId}/fees`, { headers: getHeaders() }),
                fetch(`${API_URL}/payments/student/${studentId}`, { headers: getHeaders() })
            ]);
            const summaryData = await summaryRes.json();
            const payData = await payRes.json();
            setSelectedStudentLedger({
                ...summaryData,
                payments: payData.payments || []
            });
        } catch (err) {
            alert(err.message || "Failed to load student ledger");
        }
    };

    const selectedPayStudent = students.find((s) => s._id === payStudentId);
    const feesForSelectedStudent = selectedPayStudent
        ? fees.filter((f) => f.course === selectedPayStudent.course)
        : [];

    const filteredFees = courseFilter
        ? fees.filter((f) => f.course.toLowerCase().includes(courseFilter.toLowerCase()))
        : fees;

    const tabBtnStyle = (tab) => ({
        padding: "8px 16px",
        backgroundColor: activeTab === tab ? "#007bff" : "#ffffff",
        color: activeTab === tab ? "#ffffff" : "#333",
        border: "1px solid #ddd",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px"
    });

    const cardStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "18px",
        marginBottom: "20px"
    };

    const inputStyle = {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "14px",
        boxSizing: "border-box"
    };

    const fieldStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "12px"
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
        <DashboardLayout title="Admin Portal">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                <button type="button" onClick={() => { setActiveTab("overview"); setMessage(""); }} style={tabBtnStyle("overview")}>
                    📊 Overview
                </button>
                <button type="button" onClick={() => { setActiveTab("fees"); setMessage(""); }} style={tabBtnStyle("fees")}>
                    📚 Fee Structures
                </button>
                <button type="button" onClick={() => { setActiveTab("recordPayment"); setMessage(""); }} style={tabBtnStyle("recordPayment")}>
                    💳 Record Payment
                </button>
                <button type="button" onClick={() => { setActiveTab("students"); setMessage(""); }} style={tabBtnStyle("students")}>
                    🎓 Students & Defaulters
                </button>
            </div>

            {message && (
                <div
                    style={{
                        padding: "10px 14px",
                        marginBottom: "16px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        backgroundColor: isError ? "#f8d7da" : "#d4edda",
                        color: isError ? "#721c24" : "#155724",
                        border: `1px solid ${isError ? "#f5c6cb" : "#c3e6cb"}`
                    }}
                >
                    {message}
                </div>
            )}

            {loading ? (
                <p style={{ color: "#666" }}>Loading admin portal...</p>
            ) : (
                <>
                    {activeTab === "overview" && dashboardData && (
                        <div>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                                <div style={{ ...cardStyle, flex: 1, minWidth: "160px", textAlign: "center", marginBottom: 0 }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>Total Collected</p>
                                    <h2 style={{ margin: 0, fontSize: "22px", color: "#28a745" }}>
                                        {formatCurrency(dashboardData.totalCollected)}
                                    </h2>
                                </div>
                                <div style={{ ...cardStyle, flex: 1, minWidth: "160px", textAlign: "center", marginBottom: 0 }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>Total Pending</p>
                                    <h2 style={{ margin: 0, fontSize: "22px", color: "#dc3545" }}>
                                        {formatCurrency(dashboardData.totalPending)}
                                    </h2>
                                </div>
                                <div style={{ ...cardStyle, flex: 1, minWidth: "160px", textAlign: "center", marginBottom: 0 }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>Overdue Defaulters</p>
                                    <h2 style={{ margin: 0, fontSize: "22px", color: "#d97706" }}>
                                        {(dashboardData.overdueDefaulters || []).length}
                                    </h2>
                                </div>
                            </div>

                            <div style={cardStyle}>
                                <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#222" }}>Mode-wise Collection Breakdown</h3>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    {["Cash", "UPI", "Card"].map((m) => (
                                        <div key={m} style={{ flex: 1, minWidth: "140px", padding: "12px", border: "1px solid #eee", borderRadius: "4px", backgroundColor: "#fafafa", textAlign: "center" }}>
                                            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#555", fontWeight: "bold" }}>{m}</p>
                                            <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
                                                {formatCurrency(dashboardData.modeWiseCollection?.[m] || 0)}
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "fees" && (
                        <div>
                            <div style={cardStyle}>
                                <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#222" }}>
                                    {editingFeeId ? "Edit Fee Structure" : "Add New Fee Structure"}
                                </h3>
                                <form onSubmit={handleSaveFee} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "12px", fontWeight: "bold" }}>Course</label>
                                        <input
                                            value={feeForm.course}
                                            onChange={(e) => setFeeForm({ ...feeForm, course: e.target.value })}
                                            placeholder="e.g. B.Tech CSE"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "12px", fontWeight: "bold" }}>Fee Head</label>
                                        <select
                                            value={feeForm.feeHead}
                                            onChange={(e) => setFeeForm({ ...feeForm, feeHead: e.target.value })}
                                            required
                                            style={inputStyle}
                                        >
                                            <option value="">Select Fee Head</option>
                                            {FEE_HEADS.map((h) => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "12px", fontWeight: "bold" }}>Amount (₹)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={feeForm.amount}
                                            onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                                            placeholder="Enter amount"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "12px", fontWeight: "bold" }}>Due Date</label>
                                        <input
                                            type="date"
                                            value={feeForm.dueDate}
                                            onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", gridColumn: "1 / -1" }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#007bff",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "4px",
                                                fontWeight: "bold",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {editingFeeId ? "Update Fee Structure" : "+ Add Fee Structure"}
                                        </button>
                                        {editingFeeId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingFeeId(null);
                                                    setFeeForm({ course: "", feeHead: "", amount: "", dueDate: "" });
                                                }}
                                                style={{
                                                    padding: "8px 14px",
                                                    backgroundColor: "#6c757d",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div style={cardStyle}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                                    <h3 style={{ margin: 0, fontSize: "16px", color: "#222" }}>Fee Structures ({filteredFees.length})</h3>
                                    <select
                                        value={courseFilter}
                                        onChange={(e) => setCourseFilter(e.target.value)}
                                        style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}
                                    >
                                        <option value="">All Courses</option>
                                        <option value="B.Tech CSE">B.Tech CSE</option>
                                        <option value="B.Tech ECE">B.Tech ECE</option>
                                        <option value="B.Tech ME">B.Tech ME</option>
                                    </select>
                                </div>

                                {filteredFees.length === 0 ? (
                                    <p style={{ color: "#666", fontSize: "14px" }}>No fee structures found.</p>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th style={tableHeaderStyle}>Course</th>
                                                <th style={tableHeaderStyle}>Fee Head</th>
                                                <th style={tableHeaderStyle}>Amount</th>
                                                <th style={tableHeaderStyle}>Due Date</th>
                                                <th style={tableHeaderStyle}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFees.map((f) => (
                                                <tr key={f._id}>
                                                    <td style={tableCellStyle}>{f.course}</td>
                                                    <td style={tableCellStyle}>{f.feeHead}</td>
                                                    <td style={tableCellStyle}><strong>{formatCurrency(f.amount)}</strong></td>
                                                    <td style={tableCellStyle}>
                                                        {f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "N/A"}
                                                    </td>
                                                    <td style={tableCellStyle}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditFeeClick(f)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#ffc107",
                                                                color: "#212529",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                marginRight: "6px",
                                                                cursor: "pointer",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFee(f._id)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#dc3545",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "recordPayment" && (
                        <div style={cardStyle}>
                            <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#222" }}>Record Student Fee Payment</h3>
                            <form onSubmit={handleRecordPayment} style={{ maxWidth: "500px" }}>
                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Select Student</label>
                                    <select
                                        value={payStudentId}
                                        onChange={(e) => {
                                            setPayStudentId(e.target.value);
                                            setPayFeeId("");
                                        }}
                                        required
                                        style={inputStyle}
                                    >
                                        <option value="">-- Choose student --</option>
                                        {students.map((s) => (
                                            <option key={s._id} value={s._id}>
                                                {s.name} ({s.rollNumber}) — {s.course}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Fee Head</label>
                                    <select
                                        value={payFeeId}
                                        onChange={(e) => setPayFeeId(e.target.value)}
                                        disabled={!payStudentId}
                                        required
                                        style={inputStyle}
                                    >
                                        <option value="">{payStudentId ? "-- Select fee head --" : "Select a student first"}</option>
                                        {feesForSelectedStudent.map((f) => (
                                            <option key={f._id} value={f._id}>
                                                {f.feeHead} — {formatCurrency(f.amount)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {payPending !== null && (
                                    <div style={{ padding: "8px 12px", backgroundColor: "#e8f4fd", color: "#0c5460", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
                                        Remaining pending for this fee head: <strong>{formatCurrency(payPending)}</strong>
                                    </div>
                                )}

                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Amount to Pay (₹)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={payPending !== null ? payPending : undefined}
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Payment Mode</label>
                                    <select
                                        value={payMode}
                                        onChange={(e) => setPayMode(e.target.value)}
                                        required
                                        style={inputStyle}
                                    >
                                        <option value="">-- Select mode --</option>
                                        {PAYMENT_MODES.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Payment Date</label>
                                    <input
                                        type="date"
                                        value={payDate}
                                        onChange={(e) => setPayDate(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={fieldStyle}>
                                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>Transaction Reference (Optional)</label>
                                    <input
                                        value={payRef}
                                        onChange={(e) => setPayRef(e.target.value)}
                                        placeholder="UPI Ref ID, Cheque No, etc."
                                        style={inputStyle}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingPayment}
                                    style={{
                                        padding: "10px 18px",
                                        backgroundColor: "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontWeight: "bold",
                                        cursor: submittingPayment ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {submittingPayment ? "Recording..." : "Record Payment & Generate Receipt"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "students" && (
                        <div>
                            {dashboardData?.overdueDefaulters?.length > 0 && (
                                <div style={{ ...cardStyle, borderLeft: "4px solid #dc3545" }}>
                                    <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#721c24" }}>
                                        🚨 Overdue Defaulters ({dashboardData.overdueDefaulters.length})
                                    </h3>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th style={tableHeaderStyle}>Student</th>
                                                <th style={tableHeaderStyle}>Roll Number</th>
                                                <th style={tableHeaderStyle}>Course</th>
                                                <th style={tableHeaderStyle}>Pending Amount</th>
                                                <th style={tableHeaderStyle}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.overdueDefaulters.map((d) => (
                                                <tr key={d.student.id}>
                                                    <td style={tableCellStyle}>{d.student.name}</td>
                                                    <td style={tableCellStyle}>{d.student.rollNumber}</td>
                                                    <td style={tableCellStyle}>{d.student.course}</td>
                                                    <td style={{ ...tableCellStyle, color: "#dc3545", fontWeight: "bold" }}>
                                                        {formatCurrency(d.pendingAmount)}
                                                    </td>
                                                    <td style={tableCellStyle}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewStudentLedger(d.student.id)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#007bff",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            View Ledger
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div style={cardStyle}>
                                <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#222" }}>
                                    All Registered Students ({students.length})
                                </h3>
                                {students.length === 0 ? (
                                    <p style={{ color: "#666", fontSize: "14px" }}>No students registered.</p>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th style={tableHeaderStyle}>Name</th>
                                                <th style={tableHeaderStyle}>Roll Number</th>
                                                <th style={tableHeaderStyle}>Course</th>
                                                <th style={tableHeaderStyle}>Phone</th>
                                                <th style={tableHeaderStyle}>Email</th>
                                                <th style={tableHeaderStyle}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((s) => (
                                                <tr key={s._id}>
                                                    <td style={tableCellStyle}><strong>{s.name}</strong></td>
                                                    <td style={tableCellStyle}>{s.rollNumber}</td>
                                                    <td style={tableCellStyle}>{s.course}</td>
                                                    <td style={tableCellStyle}>{s.phone || "N/A"}</td>
                                                    <td style={tableCellStyle}>{s.email}</td>
                                                    <td style={tableCellStyle}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewStudentLedger(s._id)}
                                                            style={{
                                                                padding: "4px 8px",
                                                                backgroundColor: "#007bff",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            View Ledger
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedStudentLedger && (
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
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            padding: "20px",
                            width: "100%",
                            maxWidth: "650px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "14px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>
                                Fee Ledger: {selectedStudentLedger.student?.name} ({selectedStudentLedger.student?.rollNumber})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedStudentLedger(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                            <div style={{ flex: 1, padding: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee", textAlign: "center", borderRadius: "4px" }}>
                                <div style={{ fontSize: "11px", color: "#666" }}>Payable</div>
                                <strong style={{ color: "#007bff" }}>{formatCurrency(selectedStudentLedger.summary?.totalPayable)}</strong>
                            </div>
                            <div style={{ flex: 1, padding: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee", textAlign: "center", borderRadius: "4px" }}>
                                <div style={{ fontSize: "11px", color: "#666" }}>Paid</div>
                                <strong style={{ color: "#28a745" }}>{formatCurrency(selectedStudentLedger.summary?.paidAmount)}</strong>
                            </div>
                            <div style={{ flex: 1, padding: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee", textAlign: "center", borderRadius: "4px" }}>
                                <div style={{ fontSize: "11px", color: "#666" }}>Pending</div>
                                <strong style={{ color: "#dc3545" }}>{formatCurrency(selectedStudentLedger.summary?.pendingAmount)}</strong>
                            </div>
                        </div>

                        <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>Course Fee Structure</h4>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Head</th>
                                    <th style={tableHeaderStyle}>Amount</th>
                                    <th style={tableHeaderStyle}>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedStudentLedger.feeStructures || []).map((fs) => (
                                    <tr key={fs._id}>
                                        <td style={tableCellStyle}>{fs.feeHead}</td>
                                        <td style={tableCellStyle}>{formatCurrency(fs.amount)}</td>
                                        <td style={tableCellStyle}>
                                            {fs.dueDate ? new Date(fs.dueDate).toLocaleDateString("en-IN") : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>Payments Recorded</h4>
                        {selectedStudentLedger.payments?.length === 0 ? (
                            <p style={{ color: "#666", fontSize: "13px" }}>No payments recorded yet.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Receipt No</th>
                                        <th style={tableHeaderStyle}>Head</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Mode</th>
                                        <th style={tableHeaderStyle}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStudentLedger.payments.map((p) => (
                                        <tr key={p._id}>
                                            <td style={tableCellStyle}><strong>{p.receiptNo}</strong></td>
                                            <td style={tableCellStyle}>{p.feeStructure?.feeHead || "Fee"}</td>
                                            <td style={tableCellStyle}>{formatCurrency(p.amount)}</td>
                                            <td style={tableCellStyle}>{p.paymentMode}</td>
                                            <td style={tableCellStyle}>
                                                {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div style={{ marginTop: "16px", textAlign: "right" }}>
                            <button
                                type="button"
                                onClick={() => setSelectedStudentLedger(null)}
                                style={{
                                    padding: "6px 14px",
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
