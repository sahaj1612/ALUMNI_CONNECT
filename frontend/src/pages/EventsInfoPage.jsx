import { PublicHeader } from "../components/PublicHeader.jsx";

export function EventsInfoPage() {
  return (
    <div className="public-page">
      <PublicHeader />

      <section className="page-header">
        <h1>Events at SDMCET</h1>
        <p>Innovation, Culture, and Technology Together</p>
      </section>

      <main className="public-container">
        <section className="public-section">
          <h2>Insignia : Techno-Cultural Festival</h2>
          <p>
            Insignia is the flagship annual techno-cultural festival of SDMCET,
            attracting students from across the state and neighboring regions.
          </p>
          <p>
            It includes paper presentations, quizzes, business challenges, science
            projects, innovation showcases, and cultural competitions.
          </p>
          <p>
            Special highlights include live concerts, auto expos, drone competitions, and
            social initiatives like blood donation camps.
          </p>
        </section>

        <section className="public-section">
          <h2>National Level Cybersecurity & Technology Event</h2>
          <p>
            SDMCET hosted a national-level event focused on cybersecurity, AI, and
            blockchain technologies.
          </p>
          <p>
            The event included a large-scale Hackathon with multiple teams showcasing
            innovation.
          </p>
          <p>
            <strong>Key Highlights:</strong>
          </p>
          <ul>
            <li>Cybersecurity Career Guidance</li>
            <li>AI in Cybersecurity & Ethical AI</li>
            <li>Blockchain Security Applications</li>
            <li>Expert Talks & Panel Discussions</li>
          </ul>
          <p>It provided a strong platform for learning and collaboration.</p>
        </section>
      </main>
    </div>
  );
}
