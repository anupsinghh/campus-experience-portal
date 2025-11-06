import { useState, useEffect } from 'react';
import { experiencesAPI } from '../services/api';
import ExperienceCard from '../components/ExperienceCard';
import FilterBar from '../components/FilterBar';
import './ExperienceList.css';

function ExperienceList() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    branch: '',
    year: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExperiences();
  }, [filters, searchTerm]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const filterParams = { ...filters };
      if (searchTerm) {
        filterParams.search = searchTerm;
      }
      const data = await experiencesAPI.getAll(filterParams);
      setExperiences(data);
      setError(null);
    } catch (err) {
      setError('Failed to load experiences. Please try again later.');
      console.error('Error loading experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading experiences...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="experience-list">
      <div className="container">
        <h1 className="page-title">Interview Experiences</h1>
        <p className="page-subtitle">
          Browse and filter placement experiences shared by students and alumni
        </p>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
        />

        {experiences.length === 0 ? (
          <div className="no-results">
            <p>No experiences found matching your filters.</p>
            <p>Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="experiences-grid">
            {experiences.map((experience) => (
              <ExperienceCard key={experience._id || experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExperienceList;

