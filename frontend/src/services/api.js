// Resolve API base URL with env first, then production (Vercel) vs local fallbacks
const getDefaultApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    // If deployed on Vercel (production), use the Render backend
    if (host.endsWith('vercel.app')) {
      return 'https://placement-portal-backend-wq06.onrender.com';
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
    const { withAuth, ...restOptions } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...restOptions.headers,
    };

    // Attach Authorization header when requested and running in the browser
    if (withAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...restOptions,
    });

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
  login: (email, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

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

  getById: (id) => fetchAPI(`/experiences/${id}`),

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
};

// Companies API
export const companiesAPI = {
  getAll: () => fetchAPI('/companies'),
};

// Insights API
export const insightsAPI = {
  getAll: () => fetchAPI('/insights'),
};

