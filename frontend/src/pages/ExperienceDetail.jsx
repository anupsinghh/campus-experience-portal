import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { experiencesAPI } from '../services/api';
import CommentSection from '../components/CommentSection.jsx';
import './ExperienceDetail.css';

function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExperience();
  }, [id]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      const data = await experiencesAPI.getById(id);
      setExperience(data);
      setError(null);
    } catch (err) {
      setError('Failed to load experience. Please try again later.');
      console.error('Error loading experience:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading experience details...</div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="container">
        <div className="error">{error || 'Experience not found'}</div>
        <Link to="/experiences" className="back-link">
          Back to Experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="experience-detail">
      <div className="container">
        <Link to="/experiences" className="back-link">
          Back to Experiences
        </Link>

        <div className="detail-header">
          <div>
            <h1 className="detail-title">
              {experience.company} - {experience.role}
            </h1>
            {/* Author with clickable @username */}
            <div className="detail-author">
              {experience.author?.username ? (
                <Link to={`/user/${experience.author.username}`} className="author-link">
                  <span className="author-name">{experience.author?.name || 'Anonymous'}</span>
                  <span className="author-username">@{experience.author.username}</span>
                </Link>
              ) : (
                <span className="author-name">{experience.author?.name || experience.authorName || 'Anonymous'}</span>
              )}
            </div>
            <div className="detail-meta">
              <span className="meta-badge">{experience.branch}</span>
              <span className="meta-badge">Year {experience.year}</span>
              {experience.package && (
                <span className="meta-badge highlight">{experience.package}</span>
              )}
              <span className={`offer-badge ${experience.offerStatus.toLowerCase()}`}>
                {experience.offerStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section">
            <h2>Placement Round</h2>
            <div className="rounds-list">
              {experience.rounds.map((round, index) => (
                <div key={index} className="round-card">
                  <div className="round-header">
                    <h3>Round {round.roundNumber}: {round.roundName}</h3>
                  </div>

                  {round.questions && round.questions.length > 0 && (
                    <div className="round-questions">
                      <h4>Questions Asked:</h4>
                      <ul>
                        {round.questions.map((question, qIndex) => (
                          <li key={qIndex}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {round.feedback && (
                    <div className="round-feedback">
                      <h4>Feedback/Tips:</h4>
                      <p>{round.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {experience.tips && (
            <section className="detail-section">
              <h2>General Tips & Advice</h2>
              <p className="tips-content">{experience.tips}</p>
            </section>
          )}

          <section className="detail-section">
            <h2>Additional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Interview Date:</strong> {
                  experience.interviewDate
                    ? (typeof experience.interviewDate === 'string'
                      ? experience.interviewDate.split('T')[0]
                      : new Date(experience.interviewDate).toLocaleDateString())
                    : 'Not specified'
                }
              </div>
              <div className="info-item">
                <strong>Posted By:</strong> {experience.authorName || (experience.author?.name) || 'Anonymous'}
              </div>
              {experience.createdAt && (
                <div className="info-item">
                  <strong>Posted On:</strong>{' '}
                  {new Date(experience.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </section>

          {/* Comment Section */}
          <section className="detail-section">
            <CommentSection
              experienceId={experience._id}
              experienceAuthorId={experience.author?._id ?? experience.author?.id}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExperienceDetail;

