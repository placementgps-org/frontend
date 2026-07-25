/**
 * API service layer for Placement GPS.
 * Provides named functions for all auth and user endpoints.
 * Handles JWT attachment and error formatting.
 */

const API_BASE = '/api';

/**
 * Helper to make API requests with standard error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('pgps_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (error) {
    throw new Error('Network error. Please check your internet connection.');
  }

  let data = {};
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (err) {
      throw new Error('Invalid response from server.');
    }
  } else {
    const text = await response.text();
    throw new Error(text || `Error ${response.status}: ${response.statusText}`);
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Auth Endpoints ───────────────────────────────────────────────────────────

export const registerUser = (userData) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginUser = (credentials) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const sendEmailOTP = (data) =>
  apiRequest('/auth/send-email-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const sendPhoneOTP = (data) =>
  apiRequest('/auth/send-phone-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyOTP = (data) =>
  apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const forgotPassword = (data) =>
  apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resetPassword = (data) =>
  apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const logoutUser = () =>
  apiRequest('/auth/logout', {
    method: 'POST',
  });

// ── User Endpoints ───────────────────────────────────────────────────────────

export const getProfile = () =>
  apiRequest('/user/profile', {
    method: 'GET',
  });

export const updateProfile = (data) =>
  apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
