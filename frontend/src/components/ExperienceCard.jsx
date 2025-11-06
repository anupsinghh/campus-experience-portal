import { Link } from 'react-router-dom';
import './ExperienceCard.css';

function ExperienceCard({ experience }) {
  return (
    <div className="experience-card">
      <div className="card-header">
        <h3 className="card-title">
          <Link to={`/experiences/${experience._id || experience.id}`}>
            {experience.company} - {experience.role}
          </Link>
        </h3>
        <span className={`offer-badge ${experience.offerStatus.toLowerCase()}`}>
          {experience.offerStatus}
        </span>
      </div>
      
      <div className="card-body">
        <div className="card-meta">
          <span className="meta-item">
            <strong>Branch:</strong> {experience.branch}
          </span>
          <span className="meta-item">
            <strong>Year:</strong> {experience.year}
          </span>
          {experience.package && (
            <span className="meta-item">
              <strong>Package:</strong> {experience.package}
            </span>
          )}
        </div>
        
        {experience.tips && (
          <p className="card-tips">{experience.tips}</p>
        )}
        
        <div className="card-footer">
          <span className="card-author">By {experience.authorName || (experience.author?.name) || 'Anonymous'}</span>
          <Link to={`/experiences/${experience._id || experience.id}`} className="card-link">
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ExperienceCard;

