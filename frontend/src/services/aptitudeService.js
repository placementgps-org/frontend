const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const BASE_URL = `${API_BASE}/aptitude`;

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pgps_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API Request Failed');
  }
  
  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('Error connecting to the server');
  }
};

export const aptitudeService = {
  getCategories: async () => {
    return fetchWithAuth('/categories');
  },

  getCategoryTopics: async (categoryId) => {
    return fetchWithAuth(`/categories/${categoryId}/topics`);
  },

  getTopicContent: async (categoryId, topicId) => {
    return fetchWithAuth(`/topics/${categoryId}/${topicId}`);
  },

  getQuestions: async (categoryId, topicId, difficulty, limit = 10, excludeIds = []) => {
    let url = `/questions?category=${categoryId}&topic=${topicId}&limit=${limit}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (excludeIds.length > 0) url += `&excludeIds=${excludeIds.join(',')}`;
    return fetchWithAuth(url);
  },

  submitAttempt: async (questionId, selectedAnswer, timeTaken) => {
    return fetchWithAuth('/attempt', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        selectedAnswer,
        timeTaken
      })
    });
  },

  generateQuestions: async (category, topic, difficulty, count = 5) => {
    return fetchWithAuth('/generate', {
      method: 'POST',
      body: JSON.stringify({
        category,
        topic,
        difficulty,
        count
      })
    });
  },

  getCompanyQuestions: async (filters) => {
    const params = new URLSearchParams(filters);
    return fetchWithAuth(`/company-questions?${params.toString()}`);
  },

  getProgress: async () => {
    return fetchWithAuth('/progress');
  },


  generateTopicNotes: async (category, topicName) => {
    return fetchWithAuth('/generate-notes', {
      method: 'POST',
      body: JSON.stringify({ category, topicName })
    });
  }
};
