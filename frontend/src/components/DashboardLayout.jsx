import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
    const navigate = useNavigate();

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f4f6f8",
                fontFamily: "Arial, sans-serif",
                color: "#333333"
            }}
        >
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 24px",
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #ddd",
                    flexWrap: "wrap",
                    gap: "12px"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#222"
                    }}
                >
                    <span style={{ fontSize: "20px" }}>🧾</span>
                    <span>FeeDesk</span>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                            {currentUser.name || "User"}
                        </span>
                        <span
                            style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                backgroundColor: "#e2e8f0",
                                color: "#333333",
                                padding: "2px 8px",
                                borderRadius: "10px"
                            }}
                        >
                            {currentUser.role || "User"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            border: "1px solid #f5c6cb",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main
                style={{
                    flex: 1,
                    maxWidth: "1000px",
                    width: "100%",
                    margin: "0 auto",
                    padding: "24px 16px",
                    boxSizing: "border-box"
                }}
            >
                {title && (
                    <div style={{ marginBottom: "20px" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#666" }}>
                            Welcome back, {currentUser.name || "User"}!
                        </p>
                        <h1 style={{ margin: 0, fontSize: "24px", color: "#222" }}>
                            {title}
                        </h1>
                    </div>
                )}

                {children}
            </main>

            <footer
                style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#888",
                    fontSize: "12px",
                    borderTop: "1px solid #ddd",
                    backgroundColor: "#ffffff",
                    marginTop: "auto"
                }}
            >
                <p style={{ margin: 0 }}>
                    © {new Date().getFullYear()} FeeDesk — Fee Collection & Receipt Management System
                </p>
            </footer>
        </div>
    );
}
