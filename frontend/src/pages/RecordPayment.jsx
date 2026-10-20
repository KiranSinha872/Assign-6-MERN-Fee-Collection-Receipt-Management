import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    getStudentsApi,
    getFeesApi,
    recordPaymentApi,
    getStudentPaymentsApi
} from "../api/feeApi";

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
                const stuData = await getStudentsApi(token);
                const feeData = await getFeesApi(token);
                setStudents(stuData.students || []);
                setFees(feeData.feeStructures || []);
            } catch (err) {
                setError(err.message || "Failed to load data.");
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const loadPending = async () => {
            if (!studentId || !feeStructureId) {
                setPendingForFee(null);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const data = await getStudentPaymentsApi(token, studentId);
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
            const data = await recordPaymentApi(token, {
                studentId,
                feeStructureId,
                amount: Number(amount),
                paymentMode,
                paymentDate,
                transactionRef
            });

            setSuccess(
                `Payment recorded. Receipt No: ${data.payment.receiptNo}`
            );

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
                            disabled={!studentId}
                            required
                        >
                            <option value="">
                                {studentId ? "Select fee head" : "First select a student"}
                            </option>
                            {filteredFees.map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.feeHead} — ₹{Number(f.amount).toLocaleString("en-IN")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {pendingForFee !== null && (
                        <div className="form-hint">
                            Pending for this head:{" "}
                            <strong>
                                ₹{Number(pendingForFee).toLocaleString("en-IN")}
                            </strong>
                        </div>
                    )}

                    <div className="form-field">
                        <label htmlFor="amount">Amount to Pay (₹)</label>
                        <input
                            id="amount"
                            type="number"
                            min="1"
                            max={pendingForFee !== null ? pendingForFee : undefined}
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
                            <option value="">Select payment mode</option>
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
                            max={new Date().toISOString().split("T")[0]}
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
                            placeholder="UPI Ref ID, Cheque No, etc."
                        />
                    </div>

                    {error && (
                        <p className="auth-message error" role="status">
                            {error}
                        </p>
                    )}

                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? "Recording..." : "Record Payment"}
                    </button>
                </form>
            </section>
        </DashboardLayout>
    );
}
