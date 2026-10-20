
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FeeForm from "../components/FeeForm";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5002/api"}/fees`;

export default function FeeEdit({ user }) {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        course: "",
        feeHead: "",
        amount: "",
        dueDate: ""
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFee = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load fee structure.");
                const fee = data.feeStructure;

                setForm({
                    course: fee.course,
                    feeHead: fee.feeHead,
                    amount: fee.amount,
                    dueDate: fee.dueDate
                        ? new Date(fee.dueDate).toISOString().split("T")[0]
                        : ""
                });
            } catch (err) {
                setError(err.message || "Failed to load fee structure.");
            } finally {
                setLoading(false);
            }
        };

        loadFee();
    }, [id]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update fee structure.");
            navigate("/admin/fees");
        } catch (err) {
            setError(err.message || "Failed to update fee structure.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Edit Fee Structure" user={user}>
            <section className="dashboard-section">
                <div className="section-heading">
                    <span className="section-icon">✏️</span>
                    <div>
                        <h2>Edit Fee Structure</h2>
                        <p>Update the fee entry details.</p>
                    </div>
                </div>

                {loading && <p>Loading fee structure...</p>}

                {!loading && (
                    <FeeForm
                        form={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        loading={submitting}
                        error={error}
                        submitLabel="Update Fee Structure"
                    />
                )}
            </section>
        </DashboardLayout>
    );
}
