
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-logo">🩸</span>
          <span>LifeFlow</span>
        </div>

        <div className="dashboard-user">
          <div className="dashboard-user-info">
            <span className="dashboard-user-name">
              {user.name || "User"}
            </span>
            <span className="dashboard-user-role">
              {user.role || "Donor"}
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
            Welcome back, {user.name || "User"}!
          </p>
          <h1>{title}</h1>
        </div>

        {children}
      </main>

      <footer className="dashboard-footer">
        <p>© {new Date().getFullYear()} LifeFlow Blood Bank Management System</p>
      </footer>
    </div>
  );
}
