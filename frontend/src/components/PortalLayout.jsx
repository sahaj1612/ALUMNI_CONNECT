import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function PortalLayout({
  title,
  section,
  onSectionChange,
  navigation,
  children,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        {navigation.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`portal-nav-link ${section === item.key ? "is-active" : ""}`}
            onClick={() => onSectionChange(item.key)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <p className="eyebrow">SDMCET AlumniConnect</p>
            <h1>{title}</h1>
          </div>
          <div className="inline-actions">
            <Link to="/" className="ghost-link">
              Back to Home
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
