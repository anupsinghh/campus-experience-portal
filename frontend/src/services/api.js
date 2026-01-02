// Resolve API base URL with env first, then production (Vercel) vs local fallbacks
const getDefaultApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    // If deployed on Vercel (production), use the Render backend
    if (host.endsWith('vercel.app')) {
      return 'https://campus-experience-portal.onrender.com';
    }
  }
  // Local dev fallback
  return 'http://localhost:3001';
};

const resolvedBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : getDefaultApiBase();

const API_BASE_URL = resolvedBase.replace(/\/$/, '') + '/api';

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const { withAuth, body, method, headers: customHeaders, ...restOptions } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Attach Authorization header when requested and running in the browser
    if (withAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const fetchOptions = {
      method: method || 'GET',
      headers,
      ...restOptions,
    };

    // Always include body for POST, PUT, PATCH, DELETE requests if body is provided
    const httpMethod = method ? method.toUpperCase() : 'GET';
    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod)) {
      fetchOptions.body = body;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (data && (data.error || data.message)) ||
        `API error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (identifier, password) => {
    // Ensure values are not empty
    if (!identifier || !password) {
      return Promise.reject(new Error('Please provide email/username and password'));
    }
    
    // Ensure identifier and password are strings and trimmed
    const trimmedIdentifier = String(identifier).trim();
    const trimmedPassword = String(password).trim();
    
    if (!trimmedIdentifier || !trimmedPassword) {
      return Promise.reject(new Error('Please provide email/username and password'));
    }
    
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: trimmedIdentifier, password: trimmedPassword }),
    });
  },

  register: (payload) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () =>
    fetchAPI('/auth/me', {
      withAuth: true,
    }),
};

// Experiences API
export const experiencesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.company) params.append('company', filters.company);
    if (filters.role) params.append('role', filters.role);
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.year) params.append('year', filters.year);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return fetchAPI(`/experiences${queryString ? `?${queryString}` : ''}`);
  },

  getFilterOptions: () => fetchAPI('/experiences/filters'),

  getById: (id) => fetchAPI(`/experiences/${id}`),

  getMyExperiences: () =>
    fetchAPI('/experiences/my', {
      withAuth: true,
    }),

  create: (experienceData) =>
    fetchAPI('/experiences', {
      method: 'POST',
      body: JSON.stringify(experienceData),
      withAuth: true, // optional auth – backend treats token as optional
    }),

  update: (id, experienceData) =>
    fetchAPI(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData),
      withAuth: true,
    }),

  delete: (id) =>
    fetchAPI(`/experiences/${id}`, {
      method: 'DELETE',
      withAuth: true,
    }),

  report: (id, reason, description) =>
    fetchAPI(`/experiences/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
      withAuth: true, // optional auth
    }),
};

// Companies API
export const companiesAPI = {
  getAll: () => fetchAPI('/companies'),
};

// Insights API
export const insightsAPI = {
  getAll: () => fetchAPI('/insights'),
  searchQuestions: (company, role) => {
    const params = new URLSearchParams();
    if (company) params.append('company', company);
    if (role) params.append('role', role);
    const queryString = params.toString();
    return fetchAPI(`/insights/questions${queryString ? `?${queryString}` : ''}`);
  },
};

// User API
export const userAPI = {
  getProfile: () => fetchAPI('/users/profile', { withAuth: true }),
  updateProfile: (data) =>
    fetchAPI('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  getPublicProfile: (username) => fetchAPI(`/users/${username}`),
};

// Comments API
export const commentsAPI = {
  getByExperience: (experienceId) => fetchAPI(`/experiences/${experienceId}/comments`),

  create: (experienceId, content) =>
    fetchAPI(`/experiences/${experienceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      withAuth: true,
    }),

  delete: (commentId) =>
    fetchAPI(`/comments/${commentId}`, {
      method: 'DELETE',
      withAuth: true,
    }),
};

// Admin API
export const adminAPI = {
  // Stats
  getStats: () => fetchAPI('/admin/stats', { withAuth: true }),

  // Experiences/Moderation
  getPendingExperiences: () => fetchAPI('/admin/experiences/pending', { withAuth: true }),
  getAllExperiences: (status) => {
    const params = status ? `?status=${status}` : '';
    return fetchAPI(`/admin/experiences${params}`, { withAuth: true });
  },
  approveExperience: (id, notes) =>
    fetchAPI(`/admin/experiences/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
      withAuth: true,
    }),
  rejectExperience: (id, notes) =>
    fetchAPI(`/admin/experiences/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
      withAuth: true,
    }),
  updateExperience: (id, data) =>
    fetchAPI(`/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  deleteExperience: (id) =>
    fetchAPI(`/admin/experiences/${id}`, {
      method: 'DELETE',
      withAuth: true,
    }),
  resetModerationStatus: () =>
    fetchAPI('/admin/experiences/reset-moderation', {
      method: 'POST',
      withAuth: true,
    }),

  // Users
  getUsers: (filters) => {
    const params = new URLSearchParams();
    if (filters?.branch) params.append('branch', filters.branch);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    return fetchAPI(`/admin/users${queryString ? `?${queryString}` : ''}`, { withAuth: true });
  },
  getUserFilters: () => fetchAPI('/admin/users/filters', { withAuth: true }),
};

// Public Announcements API
export const announcementsAPI = {
  getAnnouncements: () => fetchAPI('/announcements', { withAuth: false }),

  // Reports
  getReports: (status) => {
    const params = status ? `?status=${status}` : '';
    return fetchAPI(`/admin/reports${params}`, { withAuth: true });
  },
  reviewReport: (id, status, adminNotes) =>
    fetchAPI(`/admin/reports/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
      withAuth: true,
    }),
  deleteReport: (id) =>
    fetchAPI(`/admin/reports/${id}`, {
      method: 'DELETE',
      withAuth: true,
    }),

  // Announcements
  getAnnouncements: () => fetchAPI('/admin/announcements', { withAuth: true }),
  createAnnouncement: (data) =>
    fetchAPI('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  updateAnnouncement: (id, data) =>
    fetchAPI(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  deleteAnnouncement: (id) =>
    fetchAPI(`/admin/announcements/${id}`, {
      method: 'DELETE',
      withAuth: true,
    }),

  // Company Standardization
  getCompanyStandardizations: () => fetchAPI('/admin/companies', { withAuth: true }),
  getAllCompanies: () => fetchAPI('/admin/companies/all', { withAuth: true }),
  createCompanyStandardization: (data) =>
    fetchAPI('/admin/companies', {
      method: 'POST',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  updateCompanyStandardization: (id, data) =>
    fetchAPI(`/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      withAuth: true,
    }),
  standardizeCompanyName: (experienceId, standardName) =>
    fetchAPI('/admin/companies/standardize', {
      method: 'POST',
      body: JSON.stringify({ experienceId, standardName }),
      withAuth: true,
    }),
  deleteCompanyStandardization: (id) =>
    fetchAPI(`/admin/companies/${id}`, {
      method: 'DELETE',
      withAuth: true,
    }),
};
