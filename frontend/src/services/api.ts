import axios from 'axios';
import type {
  Project,
  Booking,
  ContactMessage,
  BookingFormData,
  ContactFormData,
  LoginFormData,
  ApiResponse,
  DashboardStats,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getBySlug: (slug: string) => api.get<ApiResponse<Project>>(`/projects/${slug}`),
  getByCategory: (category: string) => 
    api.get<ApiResponse<Project[]>>(`/projects/category/${category}`),
  create: (data: FormData) => api.post<ApiResponse<Project>>('/projects', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => 
    api.put<ApiResponse<Project>>(`/projects/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete<ApiResponse>(`/projects/${id}`),
};

// Bookings API
export const bookingsApi = {
  getAll: () => api.get<ApiResponse<Booking[]>>('/bookings'),
  getById: (id: string) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  create: (data: BookingFormData) => api.post<ApiResponse<Booking>>('/bookings', data),
  updateStatus: (id: string, status: string) => 
    api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }),
  delete: (id: string) => api.delete<ApiResponse>(`/bookings/${id}`),
};

// Contact API
export const contactApi = {
  getAll: () => api.get<ApiResponse<ContactMessage[]>>('/contact'),
  getById: (id: string) => api.get<ApiResponse<ContactMessage>>(`/contact/${id}`),
  create: (data: ContactFormData) => 
    api.post<ApiResponse<ContactMessage>>('/contact', data),
  markAsRead: (id: string) => 
    api.patch<ApiResponse<ContactMessage>>(`/contact/${id}/read`),
  delete: (id: string) => api.delete<ApiResponse>(`/contact/${id}`),
};

// Auth API
export const authApi = {
  login: (data: LoginFormData) => api.post<ApiResponse>('/auth/login', data),
  verify: () => api.get<ApiResponse>('/auth/verify'),
  getAdmins: () => api.get<ApiResponse<any[]>>('/auth/admins'),
  createAdmin: (data: { email: string; password: string; name?: string }) =>
    api.post<ApiResponse<any>>('/auth/admins', data),
  deleteAdmin: (id: string) => api.delete<ApiResponse>(`/auth/admins/${id}`),
  updateProfile: (data: FormData) =>
    api.put<ApiResponse<any>>('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/auth/change-password', data),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};

// Site Content API
export const siteContentApi = {
  getAll: () => api.get<ApiResponse<any>>('/site-content'),
  getBySection: (section: string) => api.get<ApiResponse<any>>(`/site-content/${section}`),
  update: (section: string, content: any) => 
    api.put<ApiResponse<any>>(`/site-content/${section}`, { content }),
  initialize: () => api.post<ApiResponse>('/site-content/init'),
};

// Booking Config API
export const bookingConfigApi = {
  getConfig: () => api.get<ApiResponse<any>>('/booking-config'),
  saveConfig: (data: any) => api.put<ApiResponse<any>>('/booking-config', data),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; url: string; publicId: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
