import { API_BASE } from './api';

export const interviewService = {
  /**
   * Start a new interview session
   * @param {Object} params - { mode: 'typing'|'speaking', interviewType: 'hr'|'personal'|'mixed', durationMinutes: 5|10|15, interviewerId: string }
   */
  startSession: async (params) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to start interview session');
    }
    return data;
  },

  /**
   * Send student's answer and retrieve AI interviewer's next dynamic follow-up
   * @param {string} sessionId
   * @param {Object} payload - { studentAnswer: string, metrics?: object, isEnding?: boolean }
   */
  sendAnswerTurn: async (sessionId, payload) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/interview/${sessionId}/turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process interview turn');
    }
    return data;
  },

  /**
   * Finalize and generate the full 9-category structured evaluation report
   * @param {string} sessionId
   * @param {Object} payload - { speechMetrics, visualMetrics, coachingEvents }
   */
  submitEvaluation: async (sessionId, payload) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/interview/${sessionId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate interview evaluation');
    }
    return data;
  },

  /**
   * Get student's past completed interview history
   */
  getHistory: async () => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/interview/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch interview history');
    }
    return data;
  },

  /**
   * Get full details and report for a specific interview session
   * @param {string} sessionId
   */
  getSession: async (sessionId) => {
    const token = localStorage.getItem('pgps_token');
    const response = await fetch(`${API_BASE}/interview/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch interview session');
    }
    return data;
  },
};
