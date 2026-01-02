import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { adminAPI } from '../services/api.js';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Moderation states
  const [pendingExperiences, setPendingExperiences] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [allExperiences, setAllExperiences] = useState([]);
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const [allExperiencesLoading, setAllExperiencesLoading] = useState(false);
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [moderationNotes, setModerationNotes] = useState('');

  // Reports states
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportNotes, setReportNotes] = useState('');

  // Announcements states
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    expiresAt: '',
  });

  // Company standardization states
  const [companyStandardizations, setCompanyStandardizations] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [allCompaniesLoading, setAllCompaniesLoading] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [companyForm, setCompanyForm] = useState({
    standardName: '',
    variations: '',
  });

  // Users states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFiltersLoading, setUserFiltersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({ branch: '', role: '', search: '' });
  const [userFilterOptions, setUserFilterOptions] = useState({ branches: [], years: [], roles: [] });

  useEffect(() => {
    // Sync activeTab with URL parameter
    const tabFromUrl = searchParams.get('tab') || 'overview';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      // Update URL if no tab is specified
      if (!searchParams.get('tab')) {
        setSearchParams({ tab: 'overview' });
      }
    }
  }, [searchParams, activeTab, setSearchParams]);

  useEffect(() => {
    // Load stats on mount
    loadStats();
    // Also load pending experiences to show what students see
    loadPendingExperiences();
    // Load recent experiences for overview
    loadRecentExperiences();
  }, []);

  useEffect(() => {
    // Load data when tab changes
    if (activeTab === 'moderation') {
      loadPendingExperiences();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'announcements') {
      loadAnnouncements();
    } else if (activeTab === 'companies') {
      loadCompanyStandardizations();
      loadAllCompanies();
    } else if (activeTab === 'users') {
      loadUsers();
      loadUserFilters();
    }
  }, [activeTab]);

  // Note: Users are loaded when tab changes or when "Apply Filters" is clicked
  // Auto-reload on filter change can be added later if needed

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getStats();
      // Handle both response formats
      if (response.success && response.data) {
        setStats(response.data);
      } else if (response.experiences || response.reports || response.announcements) {
        // Direct data format
        setStats(response);
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingExperiences = async () => {
    try {
      setPendingLoading(true);
      const response = await adminAPI.getPendingExperiences();
      // Handle both response formats
      if (response.success && response.data) {
        setPendingExperiences(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setPendingExperiences(response);
      } else if (response.data && Array.isArray(response.data)) {
        setPendingExperiences(response.data);
      } else {
        setPendingExperiences([]);
      }
    } catch (error) {
      console.error('Error loading pending experiences:', error);
      setPendingExperiences([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const loadAllExperiences = async (status) => {
    try {
      setPendingLoading(true);
      const response = await adminAPI.getAllExperiences(status);
      // Handle both response formats
      if (response.success && response.data) {
        setAllExperiences(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setAllExperiences(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAllExperiences(response.data);
      } else {
        setAllExperiences([]);
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
      setAllExperiences([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleViewAllExperiences = async () => {
    setShowAllExperiences(true);
    try {
      setAllExperiencesLoading(true);
      const response = await adminAPI.getAllExperiences();
      // Handle both response formats
      if (response.success && response.data) {
        setAllExperiences(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setAllExperiences(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAllExperiences(response.data);
      } else {
        setAllExperiences([]);
      }
    } catch (error) {
      console.error('Error loading all experiences:', error);
      setAllExperiences([]);
    } finally {
      setAllExperiencesLoading(false);
    }
  };

  const loadRecentExperiences = async () => {
    try {
      setRecentLoading(true);
      const response = await adminAPI.getAllExperiences();
      // Handle both response formats
      let experiences = [];
      if (response.success && response.data) {
        experiences = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        experiences = response;
      } else if (response.data && Array.isArray(response.data)) {
        experiences = response.data;
      }
      // Filter to only pending experiences, then get recent 10, sorted by creation date
      const recent = experiences
        .filter(exp => exp.moderationStatus === 'pending' || !exp.moderationStatus)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setRecentExperiences(recent);
    } catch (error) {
      console.error('Error loading recent experiences:', error);
      setRecentExperiences([]);
    } finally {
      setRecentLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const response = await adminAPI.getReports();
      // Handle both response formats
      if (response.success && response.data) {
        setReports(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setReports(response);
      } else if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const response = await adminAPI.getAnnouncements();
      // Handle both response formats
      if (response.success && response.data) {
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setAnnouncements(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAnnouncements(response.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadAllCompanies = async () => {
    try {
      setAllCompaniesLoading(true);
      const response = await adminAPI.getAllCompanies();
      if (response.success && response.data) {
        setAllCompanies(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setAllCompanies(response);
      } else {
        setAllCompanies([]);
      }
    } catch (error) {
      console.error('Error loading all companies:', error);
      setAllCompanies([]);
    } finally {
      setAllCompaniesLoading(false);
    }
  };

  const loadCompanyStandardizations = async () => {
    try {
      setCompaniesLoading(true);
      const response = await adminAPI.getCompanyStandardizations();
      // Handle both response formats
      if (response.success && response.data) {
        setCompanyStandardizations(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setCompanyStandardizations(response);
      } else if (response.data && Array.isArray(response.data)) {
        setCompanyStandardizations(response.data);
      } else {
        setCompanyStandardizations([]);
      }
    } catch (error) {
      console.error('Error loading company standardizations:', error);
      setCompanyStandardizations([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleApproveExperience = async (id) => {
    try {
      await adminAPI.approveExperience(id, moderationNotes);
      setModerationNotes('');
      setSelectedExperience(null);
      await loadPendingExperiences();
      await loadStats();
      alert('Experience approved successfully');
    } catch (error) {
      console.error('Error approving experience:', error);
      alert('Failed to approve experience: ' + (error.message || 'Unknown error'));
    }
  };

  const handleRejectExperience = async (id) => {
    try {
      await adminAPI.rejectExperience(id, moderationNotes);
      setModerationNotes('');
      setSelectedExperience(null);
      await loadPendingExperiences();
      await loadStats();
      alert('Experience rejected successfully');
    } catch (error) {
      console.error('Error rejecting experience:', error);
      alert('Failed to reject experience: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await adminAPI.deleteExperience(id);
      await loadPendingExperiences();
      await loadAllExperiences();
      await loadStats();
      alert('Experience deleted successfully');
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReviewReport = async (id, status) => {
    try {
      await adminAPI.reviewReport(id, status, reportNotes);
      setReportNotes('');
      setSelectedReport(null);
      await loadReports();
      await loadStats();
      alert('Report reviewed successfully');
    } catch (error) {
      console.error('Error reviewing report:', error);
      alert('Failed to review report: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      alert('Please fill in title and content');
      return;
    }
    try {
      await adminAPI.createAnnouncement(announcementForm);
      setShowAnnouncementForm(false);
      setAnnouncementForm({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        expiresAt: '',
      });
      await loadAnnouncements();
      await loadStats();
      alert('Announcement created successfully');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminAPI.deleteAnnouncement(id);
      await loadAnnouncements();
      await loadStats();
      alert('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCreateCompanyStandardization = async () => {
    if (!companyForm.standardName) {
      alert('Please enter a standard company name');
      return;
    }
    try {
      const variations = companyForm.variations
        .split(',')
        .map(v => v.trim())
        .filter(v => v);
      await adminAPI.createCompanyStandardization({
        standardName: companyForm.standardName,
        variations,
      });
      setShowCompanyForm(false);
      setCompanyForm({ standardName: '', variations: '' });
      await loadCompanyStandardizations();
      alert('Company standardization created successfully');
    } catch (error) {
      console.error('Error creating company standardization:', error);
      alert('Failed to create company standardization: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStandardizeCompany = async (experienceId, standardName) => {
    try {
      await adminAPI.standardizeCompanyName(experienceId, standardName);
      await loadPendingExperiences();
      await loadAllExperiences();
      alert('Company name standardized successfully');
    } catch (error) {
      console.error('Error standardizing company:', error);
      alert('Failed to standardize company name: ' + (error.message || 'Unknown error'));
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('Loading users with filters:', userFilters);
      const response = await adminAPI.getUsers(userFilters);
      console.log('Users API response:', response);
      
      if (response && response.success && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : [];
        console.log('Setting users:', usersData.length);
        setUsers(usersData);
      } else if (Array.isArray(response)) {
        console.log('Setting users from array response:', response.length);
        setUsers(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Setting users from response.data:', response.data.length);
        setUsers(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users: ' + (error.message || 'Unknown error'));
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadUserFilters = async () => {
    try {
      setUserFiltersLoading(true);
      console.log('Loading user filters...');
      const response = await adminAPI.getUserFilters();
      console.log('User filters API response:', response);
      
      if (response && response.success && response.data) {
        const filterData = {
          branches: Array.isArray(response.data.branches) ? response.data.branches : [],
          years: Array.isArray(response.data.years) ? response.data.years : [],
          roles: Array.isArray(response.data.roles) ? response.data.roles : [],
        };
        console.log('Setting filter options:', filterData);
        setUserFilterOptions(filterData);
      } else if (response && response.data) {
        // Handle case where response.data is directly the filter object
        const filterData = {
          branches: Array.isArray(response.data.branches) ? response.data.branches : [],
          years: Array.isArray(response.data.years) ? response.data.years : [],
          roles: Array.isArray(response.data.roles) ? response.data.roles : [],
        };
        console.log('Setting filter options (direct data):', filterData);
        setUserFilterOptions(filterData);
      } else {
        console.warn('Unexpected filter response format:', response);
        setUserFilterOptions({ branches: [], years: [], roles: [] });
      }
    } catch (error) {
      console.error('Error loading user filters:', error);
      alert('Failed to load filter options: ' + (error.message || 'Unknown error'));
      setUserFilterOptions({ branches: [], years: [], roles: [] });
    } finally {
      setUserFiltersLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <p>Error: {error}</p>
          <button onClick={loadStats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {error && (
          <div className="admin-error-banner" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <span>⚠️ {error}</span>
            <button onClick={loadStats}>Refresh</button>
          </div>
        )}

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              {showAllExperiences ? (
                <div className="all-experiences-section">
                  <div className="section-header">
                    <h2 className="section-title">All Experiences</h2>
                    <div className="section-actions">
                      <button className="btn-secondary" onClick={() => setShowAllExperiences(false)}>
                        Back to Overview
                      </button>
                      <button className="btn-primary" onClick={handleViewAllExperiences}>
                        Refresh
                      </button>
                    </div>
                  </div>
                  {allExperiencesLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading experiences...</p>
                    </div>
                  ) : allExperiences.length === 0 ? (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <h3>No experiences found</h3>
                      <p>There are no experiences in the system yet.</p>
                    </div>
                  ) : (
                    <div className="experiences-list">
                      {allExperiences.map((exp) => (
                        <div key={exp._id} className="experience-item detailed">
                          <div className="experience-main">
                            <div className="experience-header">
                              <h3>{exp.company} - {exp.role}</h3>
                              <div className="experience-meta-badges">
                                <span className={`status-badge ${exp.moderationStatus || 'pending'}`}>
                                  {exp.moderationStatus ? exp.moderationStatus.charAt(0).toUpperCase() + exp.moderationStatus.slice(1) : 'Pending'}
                                </span>
                                <span className={`status-badge ${exp.offerStatus?.toLowerCase()}`}>
                                  {exp.offerStatus}
                                </span>
                              </div>
                            </div>
                            <div className="experience-details-grid">
                              <div className="detail-item">
                                <strong>Author:</strong> {exp.authorName || exp.author?.name || 'Anonymous'}
                                {exp.author?.username && <span style={{ color: '#64748b', marginLeft: '8px' }}>@{exp.author.username}</span>}
                              </div>
                              <div className="detail-item">
                                <strong>Branch:</strong> {exp.branch}
                              </div>
                              <div className="detail-item">
                                <strong>Year:</strong> {exp.year}
                              </div>
                              <div className="detail-item">
                                <strong>Package:</strong> {exp.package || 'N/A'}
                              </div>
                              <div className="detail-item">
                                <strong>Created:</strong> {formatDate(exp.createdAt)}
                              </div>
                              <div className="detail-item">
                                <strong>Views:</strong> {exp.views || 0}
                              </div>
                            </div>
                            {exp.rounds && exp.rounds.length > 0 && (
                              <div className="experience-rounds-preview">
                                <strong>Rounds: {exp.rounds.length}</strong>
                                <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '0.85rem' }}>
                                  {exp.rounds.map(r => r.roundName).slice(0, 2).join(', ')}
                                  {exp.rounds.length > 2 && ` +${exp.rounds.length - 2} more`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="experience-actions">
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setSelectedExperience(exp);
                                setModerationNotes('');
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="section-title">Dashboard Overview</h2>
                  <div className="stats-grid">
                <div className="stat-card stat-card-primary">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.experiences?.pending || 0}</div>
                    <div className="stat-label">Pending Experiences</div>
                    <button className="stat-action" onClick={() => handleTabChange('moderation')}>
                      Review Now →
                    </button>
                  </div>
                </div>

                <div 
                  className="stat-card stat-card-info" 
                  style={{ cursor: 'pointer' }}
                  onClick={handleViewAllExperiences}
                >
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.experiences?.total || 0}</div>
                    <div className="stat-label">Total Experiences</div>
                    <button className="stat-action" onClick={(e) => { e.stopPropagation(); handleViewAllExperiences(); }}>
                      View All →
                    </button>
                  </div>
                </div>

                <div className="stat-card stat-card-danger">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.reports?.pending || 0}</div>
                    <div className="stat-label">Pending Reports</div>
                    <button className="stat-action" onClick={() => handleTabChange('reports')}>
                      Review Now →
                    </button>
                  </div>
                </div>

                <div className="stat-card stat-card-success">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats?.announcements?.active || 0}</div>
                    <div className="stat-label">Active Announcements</div>
                    <button className="stat-action" onClick={() => handleTabChange('announcements')}>
                      Manage →
                    </button>
                  </div>
                </div>
              </div>

                  {/* Recent Experiences Section */}
                  {!showAllExperiences && (
                    <div className="recent-experiences-section" style={{ marginTop: 'var(--spacing-3xl)' }}>
                      <div className="section-header">
                        <h2 className="section-title">Recent Pending Experiences</h2>
                        <button className="btn-secondary" onClick={loadRecentExperiences}>
                          Refresh
                        </button>
                      </div>
                {recentLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading experiences...</p>
                  </div>
                ) : recentExperiences.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h3>No experiences yet</h3>
                    <p>Experiences will appear here once students start sharing.</p>
                  </div>
                ) : (
                  <div className="experiences-list">
                    {recentExperiences.map((exp) => (
                      <div key={exp._id} className="experience-item detailed">
                        <div className="experience-main">
                          <div className="experience-header">
                            <h3>{exp.company} - {exp.role}</h3>
                            <div className="experience-meta-badges">
                              <span className={`status-badge ${exp.moderationStatus || 'pending'}`}>
                                {exp.moderationStatus ? exp.moderationStatus.charAt(0).toUpperCase() + exp.moderationStatus.slice(1) : 'Pending'}
                              </span>
                              <span className={`status-badge ${exp.offerStatus?.toLowerCase()}`}>
                                {exp.offerStatus}
                              </span>
                            </div>
                          </div>
                          <div className="experience-details-grid">
                            <div className="detail-item">
                              <strong>Author:</strong> {exp.authorName || exp.author?.name || 'Anonymous'}
                            </div>
                            <div className="detail-item">
                              <strong>Branch:</strong> {exp.branch}
                            </div>
                            <div className="detail-item">
                              <strong>Year:</strong> {exp.year}
                            </div>
                            <div className="detail-item">
                              <strong>Package:</strong> {exp.package || 'N/A'}
                            </div>
                            <div className="detail-item">
                              <strong>Created:</strong> {formatDate(exp.createdAt)}
                            </div>
                            <div className="detail-item">
                              <strong>Views:</strong> {exp.views || 0}
                            </div>
                          </div>
                          {exp.rounds && exp.rounds.length > 0 && (
                            <div className="experience-rounds-preview">
                              <strong>Interview Rounds:</strong>
                              <div className="rounds-preview-list">
                                {exp.rounds.slice(0, 3).map((round, idx) => (
                                  <div key={idx} className="round-preview-item">
                                    <span className="round-number">Round {round.roundNumber}</span>
                                    <span className="round-name">{round.roundName}</span>
                                    {round.questions && round.questions.length > 0 && (
                                      <span className="round-questions-count">{round.questions.length} questions</span>
                                    )}
                                  </div>
                                ))}
                                {exp.rounds.length > 3 && (
                                  <span className="more-rounds">+{exp.rounds.length - 3} more rounds</span>
                                )}
                              </div>
                            </div>
                          )}
                          {exp.tips && (
                            <div className="experience-tips-preview">
                              <strong>Tips:</strong>
                              <p>{exp.tips.length > 150 ? `${exp.tips.substring(0, 150)}...` : exp.tips}</p>
                            </div>
                          )}
                        </div>
                        <div className="experience-actions">
                          {exp.moderationStatus === 'pending' && (
                            <button
                              className="btn-approve"
                              onClick={() => {
                                setSelectedExperience(exp);
                                setModerationNotes('');
                              }}
                            >
                              Review
                            </button>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              setSelectedExperience(exp);
                              setModerationNotes('');
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="moderation-section">
              <div className="section-header">
                <div>
                  <h2>Moderate Experiences</h2>
                  <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    These are the experiences submitted by students that are waiting for approval. Once approved, they will be visible to all users.
                  </p>
                </div>
                <div className="section-actions">
                  <button className="btn-secondary" onClick={() => loadAllExperiences('approved')}>
                    View Approved
                  </button>
                  <button className="btn-secondary" onClick={() => loadAllExperiences('rejected')}>
                    View Rejected
                  </button>
                  <button className="btn-primary" onClick={loadPendingExperiences}>
                    Refresh
                  </button>
                </div>
              </div>
              {pendingLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading experiences...</p>
                </div>
              ) : pendingExperiences.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <h3>No pending experiences</h3>
                  <p>All experiences have been reviewed! Students can now see all approved experiences.</p>
                </div>
              ) : (
                <div className="experiences-list">
                  {pendingExperiences.map((exp) => (
                    <div key={exp._id} className="experience-item detailed">
                      <div className="experience-main">
                        <div className="experience-header">
                          <h3>{exp.company} - {exp.role}</h3>
                          <div className="experience-meta-badges">
                            <span className={`status-badge ${exp.offerStatus?.toLowerCase()}`}>
                              {exp.offerStatus}
                            </span>
                            <span className="experience-meta">{exp.branch} • {exp.year}</span>
                          </div>
                        </div>
                        <div className="experience-details-grid">
                          <div className="detail-item">
                            <strong>Author:</strong> {exp.authorName || exp.author?.name || 'Anonymous'}
                            {exp.author?.username && <span style={{ color: '#64748b', marginLeft: '8px' }}>@{exp.author.username}</span>}
                          </div>
                          <div className="detail-item">
                            <strong>Package:</strong> {exp.package || 'N/A'}
                          </div>
                          <div className="detail-item">
                            <strong>Created:</strong> {formatDate(exp.createdAt)}
                          </div>
                          <div className="detail-item">
                            <strong>Views:</strong> {exp.views || 0}
                          </div>
                        </div>
                        {exp.rounds && exp.rounds.length > 0 && (
                          <div className="experience-rounds-preview">
                            <strong>Interview Rounds ({exp.rounds.length}):</strong>
                            <div className="rounds-preview-list">
                              {exp.rounds.map((round, idx) => (
                                <div key={idx} className="round-preview-item">
                                  <span className="round-number">Round {round.roundNumber}</span>
                                  <span className="round-name">{round.roundName}</span>
                                  {round.questions && round.questions.length > 0 && (
                                    <span className="round-questions-count">{round.questions.length} questions</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {exp.tips && (
                          <div className="experience-tips-preview">
                            <strong>Tips:</strong>
                            <p>{exp.tips.length > 200 ? `${exp.tips.substring(0, 200)}...` : exp.tips}</p>
                          </div>
                        )}
                      </div>
                      <div className="experience-actions">
                        <button
                          className="btn-approve"
                          onClick={() => {
                            setSelectedExperience(exp);
                            setModerationNotes('');
                          }}
                        >
                          Review
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteExperience(exp._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <div className="section-header">
                <h2>Content Reports</h2>
                <button className="btn-primary" onClick={loadReports}>Refresh</button>
              </div>
              {reportsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <h3>No reports</h3>
                  <p>All clear! No content reports to review.</p>
                </div>
              ) : (
                <div className="reports-list">
                  {reports.map((report) => (
                    <div key={report._id} className="report-item detailed">
                      <div className="report-main">
                        <div className="report-header">
                          <h3>Report #{report._id.slice(-6).toUpperCase()}</h3>
                          <span className={`status-badge ${report.status}`}>{report.status}</span>
                        </div>
                        <div className="report-details-grid">
                          <div className="detail-item">
                            <strong>Experience:</strong> {report.experience?.company} - {report.experience?.role}
                          </div>
                          <div className="detail-item">
                            <strong>Reason:</strong> <span className="reason-badge">{report.reason.replace('_', ' ')}</span>
                          </div>
                          <div className="detail-item">
                            <strong>Reported:</strong> {formatDate(report.createdAt)}
                          </div>
                          {report.reportedBy && (
                            <div className="detail-item">
                              <strong>Reported By:</strong> {report.reportedBy.name || report.reportedBy.username || 'Anonymous'}
                              {report.reportedBy.username && <span style={{ color: '#64748b', marginLeft: '8px' }}>@{report.reportedBy.username}</span>}
                            </div>
                          )}
                        </div>
                        {report.description && (
                          <div className="report-description-box">
                            <strong>Description:</strong>
                            <p>{report.description}</p>
                          </div>
                        )}
                        {report.experience && (
                          <div className="reported-experience-details">
                            <strong>Reported Experience Details:</strong>
                            <div className="experience-details-grid" style={{ marginTop: 'var(--spacing-sm)' }}>
                              <div className="detail-item">
                                <strong>Author:</strong> {report.experience.authorName || 'Anonymous'}
                              </div>
                              <div className="detail-item">
                                <strong>Branch:</strong> {report.experience.branch || 'N/A'}
                              </div>
                              <div className="detail-item">
                                <strong>Year:</strong> {report.experience.year || 'N/A'}
                              </div>
                              <div className="detail-item">
                                <strong>Package:</strong> {report.experience.package || 'N/A'}
                              </div>
                              <div className="detail-item">
                                <strong>Status:</strong> <span className={`status-badge ${report.experience.offerStatus?.toLowerCase()}`}>{report.experience.offerStatus}</span>
                              </div>
                              <div className="detail-item">
                                <strong>Created:</strong> {formatDate(report.experience.createdAt)}
                              </div>
                            </div>
                            {report.experience.rounds && report.experience.rounds.length > 0 && (
                              <div className="experience-rounds-preview" style={{ marginTop: 'var(--spacing-md)' }}>
                                <strong>Interview Rounds ({report.experience.rounds.length}):</strong>
                                <div className="rounds-preview-list">
                                  {report.experience.rounds.slice(0, 2).map((round, idx) => (
                                    <div key={idx} className="round-preview-item">
                                      <span className="round-number">Round {round.roundNumber}</span>
                                      <span className="round-name">{round.roundName}</span>
                                      {round.questions && round.questions.length > 0 && (
                                        <span className="round-questions-count">{round.questions.length} questions</span>
                                      )}
                                    </div>
                                  ))}
                                  {report.experience.rounds.length > 2 && (
                                    <span className="more-rounds">+{report.experience.rounds.length - 2} more rounds</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {report.experience.tips && (
                              <div className="experience-tips-preview" style={{ marginTop: 'var(--spacing-md)' }}>
                                <strong>Tips:</strong>
                                <p>{report.experience.tips.length > 200 ? `${report.experience.tips.substring(0, 200)}...` : report.experience.tips}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="report-actions">
                        <button
                          className="btn-primary"
                          onClick={() => {
                            setSelectedReport(report);
                            setReportNotes('');
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Review Report</h2>
                      <button className="modal-close" onClick={() => setSelectedReport(null)}>×</button>
                    </div>
                    <div className="report-review">
                      <div className="review-section">
                        <h4>Report Details</h4>
                        <div className="review-grid">
                          <div><strong>Experience:</strong> {selectedReport.experience?.company} - {selectedReport.experience?.role}</div>
                          <div><strong>Reason:</strong> <span className="reason-badge">{selectedReport.reason.replace('_', ' ')}</span></div>
                          <div><strong>Status:</strong> <span className={`status-badge ${selectedReport.status}`}>{selectedReport.status}</span></div>
                          <div><strong>Reported:</strong> {formatDate(selectedReport.createdAt)}</div>
                        </div>
                        <div className="review-description">
                          <strong>Description:</strong>
                          <p>{selectedReport.description || 'No description provided'}</p>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Admin Notes (optional)</label>
                        <textarea
                          placeholder="Add notes about this report review..."
                          value={reportNotes}
                          onChange={(e) => setReportNotes(e.target.value)}
                          rows="3"
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleReviewReport(selectedReport._id, 'resolved')}
                        >
                          ✓ Mark Resolved
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReviewReport(selectedReport._id, 'dismissed')}
                        >
                          ✗ Dismiss
                        </button>
                        <button className="btn-secondary" onClick={() => setSelectedReport(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="announcements-section">
              <div className="section-header">
                <h2>Manage Announcements</h2>
                <button className="btn-primary" onClick={() => setShowAnnouncementForm(true)}>
                  + Create Announcement
                </button>
              </div>

              {showAnnouncementForm && (
                <div className="modal-overlay" onClick={() => setShowAnnouncementForm(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Create Announcement</h2>
                      <button className="modal-close" onClick={() => setShowAnnouncementForm(false)}>×</button>
                    </div>
                    <div className="form-container">
                      <div className="form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={announcementForm.title}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                          placeholder="Enter announcement title"
                        />
                      </div>
                      <div className="form-group">
                        <label>Content *</label>
                        <textarea
                          value={announcementForm.content}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                          rows="5"
                          placeholder="Enter announcement content"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Type</label>
                          <select
                            value={announcementForm.type}
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                          >
                            <option value="general">General</option>
                            <option value="placement">Placement</option>
                            <option value="important">Important</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Priority</label>
                          <select
                            value={announcementForm.priority}
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Expires At (optional)</label>
                        <input
                          type="datetime-local"
                          value={announcementForm.expiresAt}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                        />
                      </div>
                      <div className="modal-actions">
                        <button className="btn-primary" onClick={handleCreateAnnouncement}>
                          Create Announcement
                        </button>
                        <button className="btn-secondary" onClick={() => setShowAnnouncementForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {announcementsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <h3>No announcements</h3>
                  <p>Create your first announcement to notify users!</p>
                </div>
              ) : (
                <div className="announcements-list">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="announcement-item">
                      <div className="announcement-main">
                        <div className="announcement-header">
                          <h3>{announcement.title}</h3>
                          <div className="announcement-meta">
                            <span className={`type-badge ${announcement.type}`}>{announcement.type}</span>
                            <span className={`priority-badge ${announcement.priority}`}>{announcement.priority}</span>
                            <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                              {announcement.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <p className="announcement-content">{announcement.content}</p>
                        <div className="announcement-footer">
                          <span>Published: {formatDate(announcement.publishedAt)}</span>
                          {announcement.expiresAt && (
                            <span>Expires: {formatDate(announcement.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="announcement-actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="companies-section">
              <div className="section-header">
                <h2>Company Management</h2>
                <button className="btn-primary" onClick={() => setShowCompanyForm(true)}>
                  + Add Standard Name
                </button>
              </div>

              {/* All Companies List */}
              <div className="all-companies-section" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="section-header">
                  <h3>All Company Names ({allCompanies.length})</h3>
                  <button className="btn-secondary" onClick={loadAllCompanies}>
                    Refresh
                  </button>
                </div>
                {allCompaniesLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading companies...</p>
                  </div>
                ) : allCompanies.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <h3>No companies found</h3>
                    <p>Companies will appear here once students start sharing experiences.</p>
                  </div>
                ) : (
                  <div className="companies-grid">
                    {allCompanies.map((company, idx) => (
                      <div key={idx} className="company-name-item">
                        {editingCompany === company.name ? (
                          <div className="company-edit-form">
                            <input
                              type="text"
                              value={editCompanyName}
                              onChange={(e) => setEditCompanyName(e.target.value)}
                              placeholder="Enter standard name"
                              className="company-edit-input"
                              autoFocus
                            />
                            <div className="company-edit-actions">
                              <button
                                className="btn-approve"
                                onClick={() => handleUpdateCompanyName(company.name, editCompanyName)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => {
                                  setEditingCompany(null);
                                  setEditCompanyName('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="company-name-main">
                              <h4>{company.name}</h4>
                              <span className="company-count-badge">{company.count} experience{company.count !== 1 ? 's' : ''}</span>
                            </div>
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setEditingCompany(company.name);
                                setEditCompanyName(company.name);
                              }}
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Standardizations */}
              <div className="standardizations-section" style={{ marginTop: 'var(--spacing-3xl)' }}>
                <div className="section-header">
                  <h3>Company Standardizations</h3>
                </div>

              {showCompanyForm && (
                <div className="modal-overlay" onClick={() => setShowCompanyForm(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Add Company Standardization</h2>
                      <button className="modal-close" onClick={() => setShowCompanyForm(false)}>×</button>
                    </div>
                    <div className="form-container">
                      <div className="form-group">
                        <label>Standard Company Name *</label>
                        <input
                          type="text"
                          value={companyForm.standardName}
                          onChange={(e) => setCompanyForm({ ...companyForm, standardName: e.target.value })}
                          placeholder="e.g., Google"
                        />
                      </div>
                      <div className="form-group">
                        <label>Variations (comma-separated)</label>
                        <input
                          type="text"
                          value={companyForm.variations}
                          onChange={(e) => setCompanyForm({ ...companyForm, variations: e.target.value })}
                          placeholder="e.g., Google Inc, Google LLC, Alphabet"
                        />
                        <small>Separate multiple variations with commas</small>
                      </div>
                      <div className="modal-actions">
                        <button className="btn-primary" onClick={handleCreateCompanyStandardization}>
                          Create
                        </button>
                        <button className="btn-secondary" onClick={() => setShowCompanyForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {companiesLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading company standardizations...</p>
                </div>
              ) : companyStandardizations.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h3>No company standardizations</h3>
                  <p>Add standard company names to help organize experiences!</p>
                </div>
              ) : (
                <>
                  <div className="companies-list">
                    {companyStandardizations.map((company) => (
                      <div key={company._id} className="company-item">
                        <div className="company-main">
                          <h3>{company.standardName}</h3>
                          <div className="company-variations">
                            <strong>Variations:</strong>
                            {company.variations && company.variations.length > 0 ? (
                              <div className="variations-list">
                                {company.variations.map((variation, idx) => (
                                  <span key={idx} className="variation-tag">{variation}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="no-variations">No variations</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="standardize-section">
                    <h3>Standardize Company Names</h3>
                    <p>Select experiences with non-standard company names and standardize them:</p>
                    {pendingExperiences.length > 0 ? (
                      <div className="experiences-list">
                        {pendingExperiences.slice(0, 10).map((exp) => (
                          <div key={exp._id} className="experience-item">
                            <div className="experience-main">
                              <h4>{exp.company}</h4>
                            </div>
                            <select
                              className="standardize-select"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStandardizeCompany(exp._id, e.target.value);
                                }
                              }}
                            >
                              <option value="">Select standard name...</option>
                              {companyStandardizations.map((company) => (
                                <option key={company._id} value={company.standardName}>
                                  {company.standardName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No pending experiences to standardize</p>
                    )}
                  </div>
                </>
              )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>User Management {users.length > 0 && <span className="count-badge">({users.length})</span>}</h2>
                <button className="btn-secondary" onClick={loadUsers}>
                  Refresh
                </button>
              </div>

              {/* Filters */}
              <div className="filters-section" style={{ marginBottom: 'var(--spacing-xl)' }}>
                {userFiltersLoading && (
                  <div style={{ marginBottom: 'var(--spacing-md)', color: '#666', fontSize: '0.9rem' }}>
                    Loading filter options...
                  </div>
                )}
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Department (Branch)</label>
                    <select
                      value={userFilters.branch}
                      onChange={(e) => {
                        setUserFilters({ ...userFilters, branch: e.target.value });
                      }}
                      className="filter-select"
                      disabled={userFiltersLoading}
                    >
                      <option value="">All Departments</option>
                      {userFilterOptions.branches && userFilterOptions.branches.length > 0 ? (
                        userFilterOptions.branches.map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))
                      ) : (
                        !userFiltersLoading && <option value="" disabled>No departments found</option>
                      )}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Role</label>
                    <select
                      value={userFilters.role}
                      onChange={(e) => {
                        setUserFilters({ ...userFilters, role: e.target.value });
                      }}
                      className="filter-select"
                    >
                      <option value="">All Roles</option>
                      {userFilterOptions.roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      placeholder="Search by name, username, or email..."
                      value={userFilters.search}
                      onChange={(e) => {
                        setUserFilters({ ...userFilters, search: e.target.value });
                      }}
                      className="filter-input"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={loadUsers} style={{ marginTop: 'var(--spacing-md)' }}>
                  Apply Filters
                </button>
              </div>

              {usersLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h3>No users found</h3>
                  <p>Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="users-grid">
                  {users.map((user) => (
                    <div key={user._id || user.id} className="user-card">
                      <div className="user-card-header">
                        <div className="user-avatar">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                          <h3>{user.name}</h3>
                          <p className="user-username">@{user.username}</p>
                        </div>
                        <span className={`role-badge ${user.role}`}>
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                        </span>
                      </div>
                      <div className="user-card-body">
                        <div className="user-detail-item">
                          <strong>Email:</strong> {user.email}
                        </div>
                        {user.branch && (
                          <div className="user-detail-item">
                            <strong>Department:</strong> {user.branch}
                          </div>
                        )}
                        {user.graduationYear && (
                          <div className="user-detail-item">
                            <strong>Graduation Year:</strong> {user.graduationYear}
                          </div>
                        )}
                        {user.currentCompany && (
                          <div className="user-detail-item">
                            <strong>Current Company:</strong> {user.currentCompany}
                          </div>
                        )}
                        {user.isAlumni && (
                          <div className="user-detail-item">
                            <span className="alumni-badge">Alumni</span>
                          </div>
                        )}
                        <div className="user-detail-item">
                          <strong>Joined:</strong> {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experience Review Modal - Accessible from all tabs */}
          {selectedExperience && (
            <div className="modal-overlay" onClick={() => setSelectedExperience(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Review Experience</h2>
                  <button className="modal-close" onClick={() => setSelectedExperience(null)}>×</button>
                </div>
                <div className="experience-review">
                  <div className="review-section">
                    <h4>Basic Information</h4>
                    <div className="review-grid">
                      <div><strong>Company:</strong> {selectedExperience.company}</div>
                      <div><strong>Role:</strong> {selectedExperience.role}</div>
                      <div><strong>Branch:</strong> {selectedExperience.branch}</div>
                      <div><strong>Year:</strong> {selectedExperience.year}</div>
                      <div><strong>Package:</strong> {selectedExperience.package || 'N/A'}</div>
                      <div><strong>Status:</strong> {selectedExperience.offerStatus}</div>
                      <div><strong>Moderation Status:</strong> <span className={`status-badge ${selectedExperience.moderationStatus || 'pending'}`}>{selectedExperience.moderationStatus ? selectedExperience.moderationStatus.charAt(0).toUpperCase() + selectedExperience.moderationStatus.slice(1) : 'Pending'}</span></div>
                    </div>
                  </div>
                  <div className="review-section">
                    <h4>Interview Rounds</h4>
                    {selectedExperience.rounds?.map((round, idx) => (
                      <div key={idx} className="round-item">
                        <h5>Round {round.roundNumber}: {round.roundName}</h5>
                        <div className="round-questions">
                          <strong>Questions:</strong>
                          <ul>
                            {round.questions?.map((q, qIdx) => (
                              <li key={qIdx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                        {round.feedback && (
                          <div className="round-feedback">
                            <strong>Feedback:</strong> {round.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedExperience.tips && (
                    <div className="review-section">
                      <h4>Tips</h4>
                      <p>{selectedExperience.tips}</p>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Moderation Notes (optional)</label>
                    <textarea
                      placeholder="Add notes about this review..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <div className="modal-actions">
                    {selectedExperience.moderationStatus === 'pending' && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveExperience(selectedExperience._id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectExperience(selectedExperience._id)}
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    <button className="btn-secondary" onClick={() => setSelectedExperience(null)}>
                      {selectedExperience.moderationStatus === 'pending' ? 'Cancel' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
