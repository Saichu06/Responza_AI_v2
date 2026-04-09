// src/components/Navbar.jsx
export default function Navbar({ currentPage, onNavigate, logoSrc }) {
  const handleNavigation = (page, sectionId) => {
    onNavigate(page, sectionId);
  };

  const NAV_LINKS = [
    { name: "Home",          page: "home",          section: null },
    { name: "Map",           page: "home",          section: "map" },
    { name: "Capabilities",  page: "home",          section: "capabilities" },
    { name: "Documentation", page: "documentation", section: null },
  ];

  // Helper to check if a nav item is active
  const isActive = (item) => {
    if (item.page === "documentation") {
      return currentPage === "documentation";
    }
    // For home page items (Home, Map, Capabilities)
    return currentPage === "home";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes navFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .navbar {
          background: rgba(6, 10, 20, 0.88);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0 40px;
          height: 60px;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: navFadeDown 0.4s ease both;
          box-shadow: 0 1px 0 rgba(0,255,136,0.04), 0 4px 24px rgba(0,0,0,0.3);
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-logo-img {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          object-fit: contain;
          display: block;
        }

        .navbar-logo-placeholder {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(0,255,136,0.1);
          border: 1px solid rgba(0,255,136,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .navbar-wordmark {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #eef2ff;
          letter-spacing: -0.2px;
          line-height: 1;
        }

        .navbar-wordmark span {
          color: #00ff88;
          font-weight: 800;
        }

        /* Nav links */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #3d5470;
          text-decoration: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.18s, background 0.18s;
          position: relative;
          letter-spacing: 0.01em;
          display: inline-block;
        }

        .nav-link:hover {
          color: #c8d8ee;
          background: rgba(255,255,255,0.04);
        }

        .nav-link.active {
          color: #00ff88;
          background: rgba(0,255,136,0.07);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          background: #00ff88;
          border-radius: 2px;
          box-shadow: 0 0 6px rgba(0,255,136,0.6);
        }

        /* Auth buttons */
        .navbar-auth {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-signin {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6a80a0;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          padding: 7px 16px;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s, background 0.18s;
          white-space: nowrap;
        }

        .btn-signin:hover {
          color: #c8d8ee;
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }

        .btn-getstarted {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #030d08;
          background: #00ff88;
          border: none;
          border-radius: 9px;
          padding: 7px 18px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 0 14px rgba(0,255,136,0.2);
          white-space: nowrap;
        }

        .btn-getstarted:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 22px rgba(0,255,136,0.35);
        }

        .btn-getstarted:active {
          transform: none;
        }
      `}</style>

      <nav className="navbar">
        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => handleNavigation("home", null)}>
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" className="navbar-logo-img" />
          ) : (
            <div className="navbar-logo-placeholder">
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <span className="navbar-wordmark">
            RESPONZA<span>.AI</span>
          </span>
        </div>

        {/* Nav Links */}
        <ul className="navbar-links">
          {NAV_LINKS.map((item) => (
            <li key={item.name}>
              <a
                className={`nav-link ${isActive(item) ? "active" : ""}`}
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavigation(item.page, item.section); 
                }}
                href="#"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Auth */}
        <div className="navbar-auth">
          <button className="btn-signin" onClick={() => handleNavigation("login", null)}>Sign In</button>
          <button className="btn-getstarted" onClick={() => handleNavigation("signup", null)}>Get Started</button>
        </div>
      </nav>
    </>
  );
}