
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const BASE_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";

const PAYMENT_MODES = ["Cash", "UPI", "Card"];

export default function RecordPayment({ user }) {
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [feeStructureId, setFeeStructureId] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [transactionRef, setTransactionRef] = useState("");

    const [pendingForFee, setPendingForFee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const selectedStudent = students.find((s) => s._id === studentId);
    const filteredFees = selectedStudent && selectedStudent.course
        ? fees.filter((f) => f.course === selectedStudent.course)
        : [];

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const stuRes = await fetch(`${BASE_URL}/payments/students`, { headers });
                const stuData = await stuRes.json();
                if (!stuRes.ok) throw new Error(stuData.message || "Failed to load students.");

                const feeRes = await fetch(`${BASE_URL}/fees`, { headers });
                const feeData = await feeRes.json();
                if (!feeRes.ok) throw new Error(feeData.message || "Failed to load fees.");

                setStudents(stuData.students || []);
                setFees(feeData.feeStructures || []);
            } catch (err) {
                setError(err.message || "Failed to load data.");
            }
        };

        loadData();
    }, []);

    // When fee structure changes, load pending amount for that fee for the student
    useEffect(() => {
        const loadPending = async () => {
            if (!studentId || !feeStructureId) {
                setPendingForFee(null);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BASE_URL}/payments/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load payments.");

                const paymentsForFee = (data.payments || []).filter(
                    (p) => p.feeStructure && p.feeStructure._id === feeStructureId
                );
                const paid = paymentsForFee.reduce((sum, p) => sum + p.amount, 0);
                const fee = fees.find((f) => f._id === feeStructureId);
                if (fee) {
                    setPendingForFee(fee.amount - paid);
                }
            } catch {
                setPendingForFee(null);
            }
        };

        loadPending();
    }, [studentId, feeStructureId, fees]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    feeStructureId,
                    amount: Number(amount),
                    paymentMode,
                    paymentDate,
                    transactionRef
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to record payment.");

            setSuccess(
                `Payment recorded. Receipt No: ${data.payment.receiptNo}`
            );

            // Reset form
            setStudentId("");
            setFeeStructureId("");
            setAmount("");
            setPaymentMode("");
            setPaymentDate(new Date().toISOString().split("T")[0]);
            setTransactionRef("");
            setPendingForFee(null);
        } catch (err) {
            setError(err.message || "Failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Record Payment" user={user}>
            <section className="dashboard-section">
                <div className="section-heading">
                    <span className="section-icon">💳</span>
                    <div>
                        <h2>Record a Payment</h2>
                        <p>Select student, fee head, and enter payment details.</p>
                    </div>
                </div>

                {success && (
                    <p className="auth-message success" role="status">
                        {success}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="studentId">Student</label>
                        <select
                            id="studentId"
                            value={studentId}
                            onChange={(e) => {
                                setStudentId(e.target.value);
                                setFeeStructureId("");
                                setPendingForFee(null);
                            }}
                            required
                        >
                            <option value="">Select student</option>
                            {students.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name} ({s.rollNumber}) — {s.course}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="feeStructureId">Fee Head</label>
                        <select
                            id="feeStructureId"
                            value={feeStructureId}
                            onChange={(e) => setFeeStructureId(e.target.value)}
                            required
                            disabled={!studentId}
                        >
                            <option value="">Select fee head</option>
                            {filteredFees.map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.feeHead} — ₹{f.amount.toLocaleString("en-IN")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {pendingForFee !== null && (
                        <p className="auth-message success">
                            Pending balance for this fee head: ₹
                            {pendingForFee.toLocaleString("en-IN")}
                        </p>
                    )}

                    <div className="form-field">
                        <label htmlFor="amount">Amount (₹)</label>
                        <input
                            id="amount"
                            type="number"
                            min="1"
                            max={pendingForFee || undefined}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="paymentMode">Payment Mode</label>
                        <select
                            id="paymentMode"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            required
                        >
                            <option value="">Select mode</option>
                            {PAYMENT_MODES.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="paymentDate">Payment Date</label>
                        <input
                            id="paymentDate"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="transactionRef">
                            Transaction Reference (optional)
                        </label>
                        <input
                            id="transactionRef"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            placeholder="e.g. UPI ref / cheque no."
                        />
                    </div>

                    {error && (
                        <p className="auth-message error" role="status">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Recording..." : "Record Payment"}
                    </button>
                </form>
            </section>
        </DashboardLayout>
    );
}
