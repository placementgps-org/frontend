const API_BASE = import.meta.env.VITE_API_URL || '/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('pgps_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }
  });
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Error connecting to the server');
  }
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const aiService = {
  chatWithAdvisor: async (messages) => {
    const data = await fetchWithAuth(`${API_BASE}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ messages })
    });
    return data.data; // { reply, suggestedCareers, roadmapAction, generateRoadmapFor }
  },

  generateCustomRoadmap: async (careerName) => {
    const data = await fetchWithAuth(`${API_BASE}/ai/generate-roadmap`, {
      method: 'POST',
      body: JSON.stringify({ careerName })
    });
    return data.data; // { title, description, stages }
  }
};
