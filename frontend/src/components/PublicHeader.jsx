import { Link } from "react-router-dom";

const navItems = [
  { label: "About SDMCET", path: "/about" },
  { label: "Alumni", path: "/alumni" },
  { label: "Events", path: "/events" },
  { label: "Support", path: "/support" },
];

export function PublicHeader({ actions }) {
  return (
    <header className="landing-nav public-header">
      <Link to="/" className="brand-lockup" aria-label="Go to homepage">
        <img
          src="https://cache.careers360.mobi/media/colleges/social-media/logo/SDM_College_of_Engineering_and_Technology_Logo_.png"
          alt="SDMCET logo"
        />
        <div className="brand-copy">
          <p className="brand-location">Dharwad, Karnataka</p>
          <h1>SDMCET AlumniConnect</h1>
        </div>
      </Link>
      <div className="landing-actions">
        <nav className="landing-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
        {actions}
      </div>
    </header>
  );
}
