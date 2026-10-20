
import { NavLink, useNavigate } from "react-router-dom";

export default function DashboardLayout({ title, user, children }) {
    const navigate = useNavigate();

    let currentUser = user;
    if (!currentUser) {
        try {
            currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            currentUser = {};
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    };

    const isAdmin = currentUser.role === "Admin";

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <span className="dashboard-logo">🧾</span>
                    <span>FeeDesk</span>
                </div>

                <nav className="dashboard-nav">
                    {isAdmin ? (
                        <>
                            <NavLink to="/admin/dashboard">Dashboard</NavLink>
                            <NavLink to="/admin/fees">Fee Structures</NavLink>
                            <NavLink to="/admin/payments/new">Record Payment</NavLink>
                            <NavLink to="/admin/students">Students</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/my-fees">My Fees</NavLink>
                        </>
                    )}
                </nav>

                <div className="dashboard-user">
                    <div className="dashboard-user-info">
                        <span className="dashboard-user-name">
                            {currentUser.name || "User"}
                        </span>
                        <span className="dashboard-user-role">
                            {currentUser.role || "Student"}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-heading">
                    <p className="dashboard-greeting">
                        Welcome back, {currentUser.name || "User"}!
                    </p>
                    <h1>{title}</h1>
                </div>

                {children}
            </main>

            <footer className="dashboard-footer">
                <p>© {new Date().getFullYear()} FeeDesk — Fee Collection & Receipt Management System</p>
            </footer>
        </div>
    );
}

