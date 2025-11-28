
import { Employee, LeaveRequest, PerformanceReview, AuditLog, Notification, AttendanceRecord } from '../types';

// Robustly determine Base URL, defaulting to local backend but handling different env setups
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`
  };
};

// Generic fetch wrapper with robust error handling
const request = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers }
    });

    if (!response.ok) {
      // If the server returns a 4xx or 5xx error, try to parse the message
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // This catches network errors (Failed to fetch)
    console.warn(`[API] Connection failed for ${endpoint}. Backend might be down.`);
    throw error;
  }
};

export const api = {
  // Initialization
  init: () => request('/init'),

  // Employees
  employees: {
    getAll: () => request('/employees'),
    create: (data: Partial<Employee>) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Employee>) => request(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/employees/${id}`, { method: 'DELETE' }),
  },

  // Leaves
  leaves: {
    getAll: () => request('/leaves'),
    create: (data: any) => request('/leaves', { method: 'POST', body: JSON.stringify(data) }),
    approveL1: (id: string) => request(`/leaves/${id}/approve-l1`, { method: 'PATCH' }),
    approveL2: (id: string) => request(`/leaves/${id}/approve-l2`, { method: 'PATCH' }),
    reject: (id: string, reason: string) => request(`/leaves/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  },

  // Attendance
  attendance: {
    checkIn: () => request('/attendance/checkin', { method: 'POST' }),
    checkOut: () => request('/attendance/checkout', { method: 'POST' }),
    getMyHistory: () => request('/attendance/my'),
  },

  // Performance
  performance: {
    create: (data: Partial<PerformanceReview>) => request('/performance', { method: 'POST', body: JSON.stringify(data) }),
    getByEmployee: (id: string) => request(`/performance/employee/${id}`),
  },

  // Logs
  logs: {
    getAll: () => request('/audit'),
  },

  // Notifications
  notifications: {
    getMy: () => request('/notifications/my'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // AI Analysis (Server-Side)
  ai: {
    analyze: () => request('/ai/analyze', { method: 'POST' })
  }
};
