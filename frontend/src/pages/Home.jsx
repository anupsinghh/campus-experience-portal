import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to Placement Portal</h1>
          <p className="hero-subtitle">
            Your collaborative space for sharing and exploring campus placement experiences
          </p>
          <div className="hero-actions">
            <Link to="/experiences" className="btn btn-primary">
              Browse Experiences
            </Link>
            <Link to="/create" className="btn btn-secondary">
              Share Your Experience
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📝 Share Experiences</h3>
              <p>
                Post detailed interview experiences including roles, rounds, questions, and tips
                to help your peers prepare better.
              </p>
            </div>
            <div className="feature-card">
              <h3>🔍 Browse & Filter</h3>
              <p>
                Search and filter placement data by company, role, branch, or year to find
                relevant experiences quickly.
              </p>
            </div>
            <div className="feature-card">
              <h3>📊 Data Insights</h3>
              <p>
                Access data-driven insights like frequently asked questions, average package trends,
                and company statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Join the community and help fellow students prepare for their dream placements.</p>
          <Link to="/create" className="btn btn-primary">
            Share Your First Experience
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

