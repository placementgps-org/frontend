const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const BASE_URL = `${API_BASE}/courses`;

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pgps_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw { success: false, message: 'Error connecting to the server' };
  }
  
  if (!response.ok) {
    throw data || { success: false, message: 'API request failed' };
  }
  
  return data;
};

export const courseService = {
  getCourses: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await fetchWithAuth(`/${queryString}`);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourseById: async (id) => {
    try {
      return await fetchWithAuth(`/${id}`);
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }
};
