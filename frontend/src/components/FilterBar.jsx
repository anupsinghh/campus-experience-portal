import { memo } from 'react';
import './FilterBar.css';

const FilterBar = memo(function FilterBar({ filters, onFilterChange, onSearchChange, onClearFilters, searchTerm }) {
  return (
    <div className="filter-bar">
      <div className="filter-group search-group">
        <input
          type="text"
          placeholder="Search experiences"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-field"
        />
      </div>

      <div className="filter-group">
        <input
          type="text"
          placeholder="Company"
          value={filters.company || ''}
          onChange={(e) => onFilterChange('company', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <input
          type="text"
          placeholder="Role"
          value={filters.role || ''}
          onChange={(e) => onFilterChange('role', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <input
          type="text"
          placeholder="Branch"
          value={filters.branch || ''}
          onChange={(e) => onFilterChange('branch', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <input
          type="number"
          placeholder="Year"
          value={filters.year || ''}
          onChange={(e) => onFilterChange('year', e.target.value ? parseInt(e.target.value) : '')}
          className="filter-input"
        />
      </div>

      <button
        onClick={onClearFilters}
        className="clear-filters-btn"
      >
        Clear Filters
      </button>
    </div>
  );
});

export default FilterBar;
