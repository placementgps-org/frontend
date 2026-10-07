import { API_BASE } from './api';

export const resumeService = {
  /**
   * Upload resume file (PDF or DOCX) for AI analysis
   * @param {File} file
   */
  uploadResume: async (file) => {
    const token = localStorage.getItem('pgps_token');
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // Note: Do NOT set Content-Type header when sending FormData; the browser sets boundary automatically
      },
      body: formData
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload and analyze resume.');
    }

    return data;
  },

  /**
   * Fetch the authenticated user's latest saved resume analysis
   */
  getMyResume: async () => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/resume/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resume.');
    }

    return data;
  },

  /**
   * Delete user's active resume
   */
  deleteResume: async () => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/resume/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete resume.');
    }

    return data;
  },

  /**
   * Chat with AI Career Assistant & Evaluate Courses
   * @param {object} payload - { message, conversationHistory, courseId, courseName }
   */
  chatWithAssistant: async (payload) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/resume/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get response from AI Career Assistant.');
    }

    return data;
  }
};
