import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { adminAPI, insightsAPI } from '../services/api.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Moderation states
  const [pendingExperiences, setPendingExperiences] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [allExperiences, setAllExperiences] = useState([]);
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const [allExperiencesLoading, setAllExperiencesLoading] = useState(false);
  const [moderationView, setModerationView] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [moderationNotes, setModerationNotes] = useState('');

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

  // Insights states
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Coordinators (admin only)
  const [coordinators, setCoordinators] = useState([]);
  const [coordinatorsLoading, setCoordinatorsLoading] = useState(false);
  const [showCoordinatorForm, setShowCoordinatorForm] = useState(false);
  const [coordinatorForm, setCoordinatorForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'coordinator',
  });
  const [coordinatorSubmitError, setCoordinatorSubmitError] = useState(null);
  const [coordinatorSubmitting, setCoordinatorSubmitting] = useState(false);

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
    } else if (activeTab === 'notifications') {
      loadAnnouncements();
    } else if (activeTab === 'companies') {
      loadCompanyStandardizations();
      loadAllCompanies();
    } else if (activeTab === 'users') {
      loadUsers();
      loadUserFilters();
    } else if (activeTab === 'insights') {
      loadInsights();
    } else if (activeTab === 'coordinators' && user?.role === 'admin') {
      loadCoordinators();
    }
  }, [activeTab, user?.role]);

  // Note: Users are loaded when tab changes or when "Apply Filters" is clicked
  // Auto-reload on filter change can be added later if needed

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSidebarOpen(false); // Close sidebar on mobile after selecting a tab
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getStats();
      // Handle both response formats
      if (response.success && response.data) {
        setStats(response.data);
      } else if (response.experiences || response.announcements) {
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
      setAllExperiencesLoading(true);
      console.log('Loading experiences with status:', status);
      const response = await adminAPI.getAllExperiences(status);
      console.log('Experiences response:', response);
      // Handle both response formats
      if (response.success && response.data) {
        const experiences = Array.isArray(response.data) ? response.data : [];
        console.log('Setting allExperiences:', experiences.length);
        setAllExperiences(experiences);
      } else if (Array.isArray(response)) {
        console.log('Setting allExperiences from array:', response.length);
        setAllExperiences(response);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Setting allExperiences from response.data:', response.data.length);
        setAllExperiences(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        setAllExperiences([]);
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
      setAllExperiences([]);
    } finally {
      setAllExperiencesLoading(false);
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

  const loadCoordinators = async () => {
    try {
      setCoordinatorsLoading(true);
      const r = await adminAPI.getCoordinators();
      const list = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
      setCoordinators(list);
    } catch (e) {
      console.error('Error loading coordinators:', e);
      setCoordinators([]);
    } finally {
      setCoordinatorsLoading(false);
    }
  };

  const handleCreateCoordinator = async (e) => {
    e.preventDefault();
    if (!coordinatorForm.name?.trim() || !coordinatorForm.username?.trim() || !coordinatorForm.email?.trim() || !coordinatorForm.password) {
      setCoordinatorSubmitError('Name, username, email, and password are required.');
      return;
    }
    if (coordinatorForm.password.length < 6) {
      setCoordinatorSubmitError('Password must be at least 6 characters.');
      return;
    }
    setCoordinatorSubmitError(null);
    setCoordinatorSubmitting(true);
    try {
      await adminAPI.createCoordinator({
        name: coordinatorForm.name.trim(),
        username: coordinatorForm.username.trim().toLowerCase(),
        email: coordinatorForm.email.trim().toLowerCase(),
        password: coordinatorForm.password,
        role: coordinatorForm.role,
      });
      setShowCoordinatorForm(false);
      setCoordinatorForm({ name: '', username: '', email: '', password: '', role: 'coordinator' });
      await loadCoordinators();
      alert('Coordinator/Teacher added successfully.');
    } catch (err) {
      setCoordinatorSubmitError(err?.message || 'Failed to add coordinator.');
    } finally {
      setCoordinatorSubmitting(false);
    }
  };

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      const data = await insightsAPI.getAll();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights(null);
    } finally {
      setInsightsLoading(false);
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

  // Helper function to format currency values
  const formatCurrency = (value) => {
    if (typeof value === 'string') {
      return value.replace(/\$/g, '').replace(/USD/gi, '').trim();
    }
    return value;
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
      <div className="admin-wrapper">
        {/* Hamburger Menu for Mobile */}
        <div className="admin-hamburger">
          <button 
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Left Sidebar Navigation */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">Admin Panel</h1>
            <p className="sidebar-subtitle">Management</p>
          </div>
          
          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Overview</span>
              {stats?.experiences?.pending > 0 && (
                <span className="nav-badge">{stats.experiences.pending}</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`}
              onClick={() => handleTabChange('moderation')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span>Moderation</span>
              {stats?.experiences?.pending > 0 && (
                <span className="nav-badge">{stats.experiences.pending}</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notifications</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={() => handleTabChange('companies')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Companies</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users</span>
            </button>

            {user?.role === 'admin' && (
              <button 
                className={`nav-item ${activeTab === 'coordinators' ? 'active' : ''}`}
                onClick={() => handleTabChange('coordinators')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                <span>Coordinators</span>
              </button>
            )}

            <button 
              className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => handleTabChange('insights')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
              </svg>
              <span>Insights</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="admin-main">
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
                              <strong>Placement Round:</strong>
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
                  <button 
                    className={`btn-secondary ${moderationView === 'pending' ? 'active' : ''}`}
                    onClick={() => {
                      setModerationView('pending');
                      loadPendingExperiences();
                    }}
                  >
                    Pending
                  </button>
                  <button 
                    className={`btn-secondary ${moderationView === 'approved' ? 'active' : ''}`}
                    onClick={() => {
                      setModerationView('approved');
                      loadAllExperiences('approved');
                    }}
                  >
                    View Approved
                  </button>
                  <button 
                    className={`btn-secondary ${moderationView === 'rejected' ? 'active' : ''}`}
                    onClick={() => {
                      setModerationView('rejected');
                      loadAllExperiences('rejected');
                    }}
                  >
                    View Rejected
                  </button>
                  <button className="btn-primary" onClick={() => {
                    if (moderationView === 'pending') {
                      loadPendingExperiences();
                    } else {
                      loadAllExperiences(moderationView);
                    }
                  }}>
                    Refresh
                  </button>
                </div>
              </div>
              {(pendingLoading || allExperiencesLoading) ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading experiences...</p>
                </div>
              ) : (() => {
                const currentExperiences = moderationView === 'pending' ? pendingExperiences : allExperiences;
                const isEmpty = currentExperiences.length === 0;
                
                if (isEmpty) {
                  return (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      <h3>No {moderationView} experiences</h3>
                      <p>
                        {moderationView === 'pending' 
                          ? 'All experiences have been reviewed! Students can now see all approved experiences.'
                          : moderationView === 'approved'
                          ? 'No approved experiences found.'
                          : 'No rejected experiences found.'}
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="experiences-list" key="experiences-list">
                    {currentExperiences.map((exp) => (
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
                            <strong>Placement Round ({exp.rounds.length}):</strong>
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
                );
              })()}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="announcements-section">
              <div className="section-header">
                <h2>Notifications & Announcements</h2>
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

          {activeTab === 'coordinators' && user?.role === 'admin' && (
            <div className="coordinators-section">
              <div className="section-header">
                <h2>Coordinators & Teachers {coordinators.length > 0 && <span className="count-badge">({coordinators.length})</span>}</h2>
                <div className="section-actions">
                  <button className="btn-secondary" onClick={loadCoordinators}>Refresh</button>
                  <button className="btn-primary" onClick={() => { setShowCoordinatorForm(!showCoordinatorForm); setCoordinatorSubmitError(null); }}>
                    {showCoordinatorForm ? 'Cancel' : 'Add Coordinator / Teacher'}
                  </button>
                </div>
              </div>

              {showCoordinatorForm && (
                <form onSubmit={handleCreateCoordinator} className="coordinator-form" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 var(--spacing-md) 0' }}>Add coordinator or teacher</h3>
                  {coordinatorSubmitError && <p style={{ color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>{coordinatorSubmitError}</p>}
                  <div className="coordinator-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                      <label>Name *</label>
                      <input type="text" value={coordinatorForm.name} onChange={(e) => setCoordinatorForm({ ...coordinatorForm, name: e.target.value })} placeholder="Full name" required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div>
                      <label>Username *</label>
                      <input type="text" value={coordinatorForm.username} onChange={(e) => setCoordinatorForm({ ...coordinatorForm, username: e.target.value.toLowerCase() })} placeholder="username" required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div>
                      <label>Email *</label>
                      <input type="email" value={coordinatorForm.email} onChange={(e) => setCoordinatorForm({ ...coordinatorForm, email: e.target.value })} placeholder="user@marwadiuniversity.ac.in" required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div>
                      <label>Password *</label>
                      <input type="password" value={coordinatorForm.password} onChange={(e) => setCoordinatorForm({ ...coordinatorForm, password: e.target.value })} placeholder="Min 6 characters" required minLength={6} style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div>
                      <label>Role</label>
                      <select value={coordinatorForm.role} onChange={(e) => setCoordinatorForm({ ...coordinatorForm, role: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="coordinator">Coordinator</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={coordinatorSubmitting}>{coordinatorSubmitting ? 'Adding...' : 'Add'}</button>
                </form>
              )}

              {coordinatorsLoading ? (
                <div className="loading-state"><div className="loading-spinner"></div><p>Loading coordinators...</p></div>
              ) : coordinators.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                  <h3>No coordinators or teachers yet</h3>
                  <p>Add coordinators or teachers to help manage the portal on your behalf.</p>
                </div>
              ) : (
                <div className="users-grid">
                  {coordinators.map((u) => (
                    <div key={u._id || u.id} className="user-card">
                      <div className="user-card-header">
                        <div className="user-avatar">{u.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div className="user-info">
                          <h3>{u.name}</h3>
                          <p className="user-username">@{u.username}</p>
                        </div>
                        <span className={`role-badge ${u.role}`}>{u.role === 'teacher' ? 'Teacher' : 'Coordinator'}</span>
                      </div>
                      <div className="user-card-body">
                        <div className="user-detail-item"><strong>Email:</strong> {u.email}</div>
                        <div className="user-detail-item"><strong>Joined:</strong> {formatDate(u.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coordinators' && user?.role !== 'admin' && (
            <div className="empty-state">
              <p>Only admins can manage coordinators.</p>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="insights-section">
              <div className="section-header">
                <h2>Data Insights & Analytics</h2>
                <button className="btn-primary" onClick={loadInsights}>Refresh</button>
              </div>
              {insightsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading insights...</p>
                </div>
              ) : !insights ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
                  </svg>
                  <h3>No insights available</h3>
                  <p>Failed to load insights data.</p>
                </div>
              ) : (() => {
                // Prepare chart data
                const companyData = Object.entries(insights.companyDistribution || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10);

                const roleData = Object.entries(insights.roleDistribution || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8);

                const yearData = Object.entries(insights.yearDistribution || {})
                  .sort((a, b) => a[0] - b[0]);

                // Company Bar Chart
                const companyChartData = {
                  labels: companyData.map(([company]) => company),
                  datasets: [
                    {
                      label: 'Experiences',
                      data: companyData.map(([, count]) => count),
                      backgroundColor: 'rgba(168, 85, 247, 0.8)',
                      borderColor: 'rgba(168, 85, 247, 1)',
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                };

                // Role Pie Chart
                const roleChartData = {
                  labels: roleData.map(([role]) => role),
                  datasets: [
                    {
                      label: 'Roles',
                      data: roleData.map(([, count]) => count),
                      backgroundColor: [
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(244, 114, 182, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(192, 132, 252, 0.8)',
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                };

                // Year Line Chart
                const yearChartData = {
                  labels: yearData.map(([year]) => year.toString()),
                  datasets: [
                    {
                      label: 'Experiences per Year',
                      data: yearData.map(([, count]) => count),
                      borderColor: 'rgba(168, 85, 247, 1)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                    },
                  ],
                };

                const chartOptions = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        font: {
                          size: 12,
                          weight: '600',
                        },
                        padding: 15,
                        usePointStyle: true,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: '600',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      borderColor: 'rgba(168, 85, 247, 0.5)',
                      borderWidth: 1,
                      cornerRadius: 8,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                };

                const pieChartOptions = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'right',
                      labels: {
                        font: {
                          size: 11,
                          weight: '500',
                        },
                        padding: 12,
                        usePointStyle: true,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: '600',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      borderColor: 'rgba(168, 85, 247, 0.5)',
                      borderWidth: 1,
                      cornerRadius: 8,
                    },
                  },
                };

                return (
                  <>
                    {/* Stats Overview Cards */}
                    <div className="stats-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                      <div className="stat-card stat-card-primary">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{insights.overview?.totalExperiences || 0}</div>
                          <div className="stat-label">Total Experiences</div>
                        </div>
                      </div>

                      <div className="stat-card stat-card-success">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{insights.overview?.uniqueCompanies || 0}</div>
                          <div className="stat-label">Unique Companies</div>
                        </div>
                      </div>

                      <div className="stat-card stat-card-info">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{insights.overview?.uniqueRoles || 0}</div>
                          <div className="stat-label">Unique Roles</div>
                        </div>
                      </div>

                      <div className="stat-card stat-card-warning">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">₹{formatCurrency(insights.overview?.avgPackage || 0)} LPA</div>
                          <div className="stat-label">Average Package</div>
                        </div>
                      </div>

                      <div className="stat-card stat-card-danger">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">₹{formatCurrency(insights.overview?.maxPackage || 0)} LPA</div>
                          <div className="stat-label">Maximum Package</div>
                        </div>
                      </div>

                      <div className="stat-card stat-card-secondary">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">₹{formatCurrency(insights.overview?.minPackage || 0)} LPA</div>
                          <div className="stat-label">Minimum Package</div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                      <div className="chart-card" style={{ background: '#fff', borderRadius: '12px', padding: 'var(--spacing-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div className="chart-header" style={{ marginBottom: 'var(--spacing-md)' }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Top Companies</h3>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Experiences by company</p>
                        </div>
                        <div className="chart-container" style={{ height: '300px' }}>
                          {companyData.length > 0 ? (
                            <Bar data={companyChartData} options={chartOptions} />
                          ) : (
                            <p style={{ textAlign: 'center', color: '#64748b' }}>No data available</p>
                          )}
                        </div>
                      </div>

                      <div className="chart-card" style={{ background: '#fff', borderRadius: '12px', padding: 'var(--spacing-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div className="chart-header" style={{ marginBottom: 'var(--spacing-md)' }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Role Distribution</h3>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Most common job roles</p>
                        </div>
                        <div className="chart-container" style={{ height: '300px' }}>
                          {roleData.length > 0 ? (
                            <Pie data={roleChartData} options={pieChartOptions} />
                          ) : (
                            <p style={{ textAlign: 'center', color: '#64748b' }}>No data available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Year Trend Chart */}
                    {yearData.length > 0 && (
                      <div className="chart-card" style={{ background: '#fff', borderRadius: '12px', padding: 'var(--spacing-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 'var(--spacing-xl)' }}>
                        <div className="chart-header" style={{ marginBottom: 'var(--spacing-md)' }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Yearly Trends</h3>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Experiences over time</p>
                        </div>
                        <div className="chart-container" style={{ height: '300px' }}>
                          <Line data={yearChartData} options={chartOptions} />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
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
                    <h4>Placement Round</h4>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
