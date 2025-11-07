import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="layout">
      <header className={`header ${isHome ? 'header-fixed' : ''}`}>
        <div className="container">
          <div className="nav-shell">
            <Link to="/" className="logo">
              <h1>Placement Portal</h1>
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/experiences" className="nav-link">Experiences</Link>
              <Link to="/create" className="nav-link">Share Experience</Link>
              <Link to="/insights" className="nav-link">Insights</Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className={`main-content ${isHome ? 'with-fixed-header' : ''}`}>
        {children}
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Placement Portal. Helping students prepare for campus placements.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

