import { API_BASE } from './api';

export const codingService = {
  /**
   * Get supported tracks and topic taxonomies
   */
  getTopics: async () => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/coding/topics`, {
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
      throw new Error(data.message || 'Failed to load topics.');
    }

    return data;
  },

  /**
   * Get or generate a dynamic AI coding challenge
   */
  getOrGenerateChallenge: async ({ track, topic, difficulty, challengeId, forceNew = false }) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/coding/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        track,
        topic,
        difficulty,
        challengeId,
        forceNew
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Unable to generate challenge.');
    }

    return data;
  },

  /**
   * Run untrusted code against visible test cases only
   */
  runCode: async ({ challengeId, code, language }) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/coding/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        challengeId,
        code,
        language
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to run code.');
    }

    return data;
  },

  /**
   * Submit code against all test cases (visible + hidden)
   */
  submitCode: async ({ challengeId, code, language }) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/coding/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        challengeId,
        code,
        language
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit code.');
    }

    return data;
  },

  /**
   * Get user's coding practice progress and stats
   */
  getProgress: async () => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/coding/progress`, {
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
      throw new Error(data.message || 'Failed to load progress.');
    }

    return data;
  }
};
