const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const BASE_URL = `${API_BASE}/roadmap`;

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pgps_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Error connecting to the server');
  }
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const roadmapService = {
  getRoadmap: async () => {
    return await fetchWithAuth('/');
  },

  updateTargetCareer: async (careerId) => {
    return await fetchWithAuth('/career', {
      method: 'POST',
      body: JSON.stringify({ careerId })
    });
  },

  updateTopicProgress: async (topicId, status) => {
    return await fetchWithAuth('/topic', {
      method: 'POST',
      body: JSON.stringify({ topicId, status })
    });
  },

  getRecommendedCourses: async () => {
    return await fetchWithAuth('/recommended-courses');
  },

  saveCustomRoadmap: async (careerId, roadmap) => {
    return await fetchWithAuth('/custom', {
      method: 'POST',
      body: JSON.stringify({ careerId, roadmap })
    });
  },

  getKnownCareers: async () => {
    return await fetchWithAuth('/careers');
  },

  followCustomRoadmap: async (careerId, roadmap) => {
    // First save the roadmap structure, then switch to it
    await fetchWithAuth('/custom', {
      method: 'POST',
      body: JSON.stringify({ careerId, roadmap })
    });
    return await fetchWithAuth('/career', {
      method: 'POST',
      body: JSON.stringify({ careerId })
    });
  }
};
