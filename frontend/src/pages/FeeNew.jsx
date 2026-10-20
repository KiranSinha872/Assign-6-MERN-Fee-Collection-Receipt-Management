
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FeeForm from "../components/FeeForm";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5002/api"}/fees`;

const EMPTY_FORM = {
    course: "",
    feeHead: "",
    amount: "",
    dueDate: ""
};

export default function FeeNew({ user }) {
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create fee structure.");
            navigate("/admin/fees");
        } catch (err) {
            setError(err.message || "Failed to create fee structure.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Add Fee Structure" user={user}>
            <section className="dashboard-section">
                <div className="section-heading">
                    <span className="section-icon">➕</span>
                    <div>
                        <h2>New Fee Structure</h2>
                        <p>Add a fee entry for a course.</p>
                    </div>
                </div>

                <FeeForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    submitLabel="Create Fee Structure"
                />
            </section>
        </DashboardLayout>
    );
}
