import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModals } from '../context/AuthModalContext.jsx';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModals();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className={`header ${isHome ? 'header-fixed' : ''}`}>
        <div className="container">
          <div className="nav-shell">
            <Link to="/" className="logo">
              <h1>Placement Portal</h1>
            </Link>
            <nav className="nav">
              {isHome && !isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className="nav-link nav-button-ghost"
                    onClick={openRegister}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    className="nav-link nav-button-ghost"
                    onClick={openLogin}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/experiences" className="nav-link">Experiences</Link>
                  {isAuthenticated && (
                    <Link to="/create" className="nav-link">Share Experience</Link>
                  )}
                  <Link to="/insights" className="nav-link">Insights</Link>
                  <div className="nav-auth">
                    {isAuthenticated ? (
                      <>
                        <span className="nav-user">
                          {user?.name ? `Hi, ${user.name}` : user?.email}
                        </span>
                        <button
                          type="button"
                          className="nav-link nav-button"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="nav-link nav-button-ghost"
                          onClick={openRegister}
                        >
                          Register
                        </button>
                        <button
                          type="button"
                          className="nav-link nav-button-ghost"
                          onClick={openLogin}
                        >
                          Login
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
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


