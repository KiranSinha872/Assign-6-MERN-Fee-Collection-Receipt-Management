
const FEE_HEADS = ["Tuition", "Exam", "Transport", "Other"];

export default function FeeForm({ form, onChange, onSubmit, loading, error, submitLabel }) {
    return (
        <form onSubmit={onSubmit}>
            <div className="form-field">
                <label htmlFor="course">Course</label>
                <input
                    id="course"
                    name="course"
                    value={form.course}
                    onChange={onChange}
                    placeholder="e.g. B.Tech CSE"
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="feeHead">Fee Head</label>
                <select
                    id="feeHead"
                    name="feeHead"
                    value={form.feeHead}
                    onChange={onChange}
                    required
                >
                    <option value="">Select fee head</option>
                    {FEE_HEADS.map((head) => (
                        <option key={head} value={head}>
                            {head}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={onChange}
                    placeholder="Enter amount"
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="dueDate">Due Date</label>
                <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={onChange}
                    required
                />
            </div>

            {error && (
                <p className="auth-message error" role="status">
                    {error}
                </p>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Please wait..." : submitLabel}
            </button>
        </form>
    );
}
