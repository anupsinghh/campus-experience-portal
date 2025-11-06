// Resolve API base URL from env at build time, with sensible fallbacks
const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/api'
  : 'http://localhost:3001/api';

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
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
    }),

  update: (id, experienceData) =>
    fetchAPI(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData),
    }),

  delete: (id) =>
    fetchAPI(`/experiences/${id}`, {
      method: 'DELETE',
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

