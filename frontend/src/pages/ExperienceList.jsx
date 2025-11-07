import { useState, useEffect, useCallback, useMemo } from 'react';
import { experiencesAPI } from '../services/api';
import ExperienceCard from '../components/ExperienceCard';
import FilterBar from '../components/FilterBar';
import './ExperienceList.css';

function ExperienceList() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    branch: '',
    year: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadExperiences = useCallback(async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const filterParams = { ...filters };
      if (debouncedSearchTerm) {
        filterParams.search = debouncedSearchTerm;
      }
      const data = await experiencesAPI.getAll(filterParams);
      setExperiences(data);
      setError(null);
    } catch (err) {
      setError('Failed to load experiences. Please try again later.');
      console.error('Error loading experiences:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, debouncedSearchTerm, initialLoad]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      company: '',
      role: '',
      branch: '',
      year: '',
    });
  }, []);

  const filteredExperiences = useMemo(() => {
    return experiences;
  }, [experiences]);

  if (initialLoad && loading) {
    return (
      <div className="experience-list">
        <div className="container">
          <div className="loading">Loading experiences...</div>
        </div>
      </div>
    );
  }

  if (error && initialLoad) {
    return (
      <div className="experience-list">
        <div className="container">
          <div className="error">{error}</div>
        </div>
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
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          searchTerm={searchTerm}
        />

        {loading && !initialLoad && (
          <div className="loading-inline">Filtering experiences...</div>
        )}

        {!loading && filteredExperiences.length === 0 ? (
          <div className="no-results">
            <p>No experiences found matching your filters.</p>
            <p>Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="experiences-grid">
            {filteredExperiences.map((experience) => (
              <ExperienceCard key={experience._id || experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExperienceList;
