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
        navigate("/login", { replace: true });
    };

    const isAdmin = currentUser.role === "Admin";

    return (
        <div className="dashboard-page">
            <style>{`
                .dashboard-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #f8fafc;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    color: #1e293b;
                }
                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 24px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .dashboard-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .dashboard-logo {
                    font-size: 22px;
                }
                .dashboard-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .dashboard-nav a {
                    text-decoration: none;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 6px 12px;
                    border-radius: 6px;
                    transition: background 0.15s, color 0.15s;
                }
                .dashboard-nav a:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .dashboard-nav a.active {
                    background: #2563eb;
                    color: #ffffff;
                }
                .dashboard-user {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .dashboard-user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .dashboard-user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .dashboard-user-role {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    background: #e0e7ff;
                    color: #3730a3;
                    padding: 2px 8px;
                    border-radius: 12px;
                }
                .logout-btn {
                    background: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .logout-btn:hover {
                    background: #fca5a5;
                }
                .dashboard-content {
                    flex: 1;
                    max-width: 1100px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 24px 20px;
                    box-sizing: border-box;
                }
                .dashboard-heading {
                    margin-bottom: 24px;
                }
                .dashboard-greeting {
                    margin: 0 0 4px 0;
                    font-size: 13px;
                    color: #64748b;
                }
                .dashboard-heading h1 {
                    margin: 0;
                    font-size: 24px;
                    color: #0f172a;
                    font-weight: 700;
                }
                .dashboard-footer {
                    text-align: center;
                    padding: 20px;
                    color: #94a3b8;
                    font-size: 12px;
                    border-top: 1px solid #e2e8f0;
                    background: #ffffff;
                    margin-top: auto;
                }
                .dashboard-footer p {
                    margin: 0;
                }
            `}</style>

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
