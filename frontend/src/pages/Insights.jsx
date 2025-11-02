import { useState, useEffect } from 'react';
import { insightsAPI } from '../services/api';
import './Insights.css';

function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getAll();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError('Failed to load insights. Please try again later.');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading insights...</div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="container">
        <div className="error">{error || 'Failed to load insights'}</div>
      </div>
    );
  }

  return (
    <div className="insights">
      <div className="container">
        <h1 className="page-title">Data Insights & Analytics</h1>
        <p className="page-subtitle">
          Explore trends, statistics, and frequently asked questions from placement experiences
        </p>

        <div className="insights-grid">
          <div className="insight-card overview">
            <h2>Overview</h2>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{insights.overview.totalExperiences}</div>
                <div className="stat-label">Total Experiences</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{insights.overview.uniqueCompanies}</div>
                <div className="stat-label">Unique Companies</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{insights.overview.uniqueRoles}</div>
                <div className="stat-label">Unique Roles</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">₹{insights.overview.avgPackage} LPA</div>
                <div className="stat-label">Average Package</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">₹{insights.overview.maxPackage} LPA</div>
                <div className="stat-label">Maximum Package</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">₹{insights.overview.minPackage} LPA</div>
                <div className="stat-label">Minimum Package</div>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <h2>Frequently Asked Questions</h2>
            <p className="card-description">
              Most common questions asked across all interview experiences
            </p>
            <div className="questions-list">
              {insights.frequentQuestions.length > 0 ? (
                insights.frequentQuestions.map((item, index) => (
                  <div key={index} className="question-item">
                    <div className="question-rank">{index + 1}</div>
                    <div className="question-content">
                      <div className="question-text">{item.question}</div>
                      <div className="question-count">
                        Asked {item.count} {item.count === 1 ? 'time' : 'times'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No questions data available</p>
              )}
            </div>
          </div>

          <div className="insight-card">
            <h2>Company Distribution</h2>
            <p className="card-description">Number of experiences shared per company</p>
            <div className="distribution-list">
              {Object.entries(insights.companyDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([company, count]) => (
                  <div key={company} className="distribution-item">
                    <div className="distribution-name">{company}</div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: `${(count / insights.overview.totalExperiences) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="distribution-count">{count}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="insight-card">
            <h2>Year Distribution</h2>
            <p className="card-description">Experiences shared by year</p>
            <div className="distribution-list">
              {Object.entries(insights.yearDistribution)
                .sort((a, b) => b[0] - a[0])
                .map(([year, count]) => (
                  <div key={year} className="distribution-item">
                    <div className="distribution-name">{year}</div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: `${(count / insights.overview.totalExperiences) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="distribution-count">{count}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="insight-card">
            <h2>Role Distribution</h2>
            <p className="card-description">Most common job roles</p>
            <div className="distribution-list">
              {Object.entries(insights.roleDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([role, count]) => (
                  <div key={role} className="distribution-item">
                    <div className="distribution-name">{role}</div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: `${(count / insights.overview.totalExperiences) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="distribution-count">{count}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="insight-card">
            <h2>Package Trends</h2>
            <p className="card-description">Top packages by company and role</p>
            <div className="package-list">
              {insights.packageTrends.length > 0 ? (
                insights.packageTrends.map((pkg, index) => (
                  <div key={index} className="package-item">
                    <div className="package-value">₹{pkg.value} LPA</div>
                    <div className="package-details">
                      {pkg.company} - {pkg.role} ({pkg.year})
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No package data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;

