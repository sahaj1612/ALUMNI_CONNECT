import { PublicHeader } from "../components/PublicHeader.jsx";

export function SupportPage() {
  return (
    <div className="public-page">
      <PublicHeader />

      <section className="page-header">
        <h1>Support Center</h1>
        <p>We're here to help you</p>
      </section>

      <main className="public-container public-two-column">
        <section className="public-section">
          <h2>Contact Information</h2>
          <p>
            <strong>College Contact:</strong> +91 836 2447465
          </p>
          <p>
            <strong>Email:</strong> info@sdmcet.ac.in
          </p>
          <p>
            <strong>Website Issues:</strong> sahaj@gmail.com
          </p>
          <p>
            <strong>Address:</strong> SDMCET, Dharwad, Karnataka
          </p>
        </section>

        <section className="public-section">
          <h2>Frequently Asked Questions</h2>
          <h3>How to register as alumni?</h3>
          <p>You can register through the alumni portal by filling your details.</p>

          <h3>How to participate in events?</h3>
          <p>Events can be accessed through the events section and registration forms.</p>

          <h3>Who can access this platform?</h3>
          <p>Students, alumni, and faculty of SDMCET.</p>
        </section>
      </main>
    </div>
  );
}
