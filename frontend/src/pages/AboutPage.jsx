import { PublicHeader } from "../components/PublicHeader.jsx";

export function AboutPage() {
  return (
    <div className="public-page">
      <PublicHeader />

      <section className="page-header">
        <h1>About SDMCET</h1>
        <p>Shaping Engineers with Knowledge, Values, and Innovation</p>
      </section>

      <main className="public-container">
        <InfoSection title="About the Institution">
          S.D.M College of Engineering & Technology (SDMCET), located in Dharwad,
          Karnataka, is a premier engineering institution established with the vision of
          providing quality technical education. The college is known for its strong
          academic culture, experienced faculty, and commitment to innovation and
          excellence.
        </InfoSection>
        <InfoSection title="Academic Programs">
          SDMCET offers a wide range of undergraduate and postgraduate programs in
          engineering and technology. The curriculum is designed to meet industry
          standards, combining theoretical knowledge with practical application to
          prepare students for real-world challenges.
        </InfoSection>
        <InfoSection title="Infrastructure & Facilities">
          The campus is equipped with modern infrastructure including well-equipped
          laboratories, a digital library, smart classrooms, and advanced research
          centers. Students have access to all the resources needed for academic and
          personal growth.
        </InfoSection>
        <InfoSection title="Placements & Career Growth">
          The institution has an active placement cell that connects students with
          leading companies. Many top recruiters visit the campus every year, offering
          excellent career opportunities to students across various domains.
        </InfoSection>
        <InfoSection title="Alumni Contribution">
          SDMCET alumni are spread across the globe and contribute actively by mentoring
          students, conducting sessions, and supporting institutional development. The
          alumni network plays a vital role in bridging the gap between academics and
          industry.
        </InfoSection>
      </main>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <section className="public-section">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}
