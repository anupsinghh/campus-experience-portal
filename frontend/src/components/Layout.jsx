import { Link } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
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
      </header>
      
      <main className="main-content">
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

