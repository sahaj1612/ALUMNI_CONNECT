import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "../components/PublicHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const initialStudentForm = {
  usn: "",
  email: "",
  password: "",
};

const initialAlumniForm = {
  email: "",
  password: "",
};

const quickStats = [
  { value: "2K+", label: "Alumni network" },
  { value: "120+", label: "Career opportunities" },
  { value: "48", label: "Campus events" },
];

const highlightCards = [
  {
    title: "Career Opportunities",
    text: "Students can discover internships, roles, and referrals shared directly by alumni.",
  },
  {
    title: "Mentor Network",
    text: "Build meaningful connections with seniors across companies, domains, and batches.",
  },
  {
    title: "Event Hub",
    text: "Track reunions, talks, hackathons, and alumni sessions from one polished workspace.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { setSession, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("choice");
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [alumniForm, setAlumniForm] = useState(initialAlumniForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("alumniconnect-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("alumniconnect-theme", theme);
  }, [theme]);

  async function handleStudentLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/auth/student/login", {
        method: "POST",
        body: studentForm,
      });

      setSession(response);
      navigate("/student");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAlumniLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/auth/alumni/login", {
        method: "POST",
        body: alumniForm,
      });

      setSession(response);
      navigate("/alumni-portal");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-page">
      <PublicHeader
        actions={
          <button
            type="button"
            className="theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 1 0 9.8 9.8Z" />
            </svg>
          </button>
        }
      />

      <section className="hero-panel">
        <div className="hero-overlay" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Shaping Engineers with Knowledge, Values, and Innovation</p>
            <h2>Where SDMCET alumni, students, and opportunities stay connected beautifully.</h2>
            <p>
              A sharper, faster AlumniConnect experience for career discovery, community events,
              mentorship, and long-term campus engagement.
            </p>
            <div className="hero-cta-row">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  if (user?.role === "student") {
                    navigate("/student");
                    return;
                  }

                  if (user?.role === "alumni") {
                    navigate("/alumni-portal");
                    return;
                  }

                  setIsModalOpen(true);
                }}
              >
                {user ? "Open Dashboard" : "Login"}
              </button>
              <button type="button" className="secondary-button hero-secondary-button">
                Explore Events
              </button>
            </div>
            <div className="hero-stats">
              {quickStats.map((item) => (
                <article key={item.label} className="hero-stat-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-showcase">
            <div className="showcase-panel">
              <p className="showcase-label">Live campus pulse</p>
              <h3>Designed for a bold red identity with a seamless day and night experience.</h3>
              <div className="showcase-list">
                {highlightCards.map((card) => (
                  <article key={card.title} className="showcase-item">
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="closing-strip">
        <p>
          AlumniConnect brings SDMCET students and alumni together through opportunities,
          mentorship, and events in one focused space.
        </p>
      </section> */}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="close-button"
              aria-label="Cancel"
              onClick={() => {
                setIsModalOpen(false);
                setMode("choice");
                setError("");
              }}
            >
              ×
            </button>

            {mode === "choice" && (
              <div className="stack-gap">
                <h3>Welcome to AlumniConnect</h3>
                <p>Select how you want to log in.</p>
                <button type="button" className="primary-button" onClick={() => setMode("student")}>
                  Student Login
                </button>
                <button type="button" className="primary-button" onClick={() => setMode("alumni")}>
                  Alumni Login
                </button>
              </div>
            )}

            {mode === "student" && (
              <form className="stack-gap" onSubmit={handleStudentLogin}>
                <h3>Student Login</h3>
                <input
                  placeholder="USN"
                  value={studentForm.usn}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, usn: event.target.value }))
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="College Email"
                  value={studentForm.email}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={studentForm.password}
                  onChange={(event) =>
                    setStudentForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
                {error ? <p className="error-text">{error}</p> : null}
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Signing in..." : "Login"}
                </button>
                <button type="button" className="text-button" onClick={() => setMode("choice")}>
                  Back
                </button>
              </form>
            )}

            {mode === "alumni" && (
              <form className="stack-gap" onSubmit={handleAlumniLogin}>
                <h3>Alumni Login</h3>
                <input
                  type="email"
                  placeholder="Email"
                  value={alumniForm.email}
                  onChange={(event) =>
                    setAlumniForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={alumniForm.password}
                  onChange={(event) =>
                    setAlumniForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
                {error ? <p className="error-text">{error}</p> : null}
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Signing in..." : "Login"}
                </button>
                <button type="button" className="text-button" onClick={() => setMode("choice")}>
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
