import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api';

// Create a custom Axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject the Bearer JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('campus_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Extract standard error message
    const customError = {
      message: error.response?.data?.message || 'An unexpected API error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
    
    // Auto-logout on unauthorized token (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('campus_token');
      // Optional: force page reload or redirect to trigger re-auth
    }
    
    return Promise.reject(customError);
  }
);

// Unified Client interface to match existing code exactly
export const apiClient = {
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(endpoint, config);
    return response.data;
  },

  async post<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<T>(endpoint, body, config);
    return response.data;
  },

  async put<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<T>(endpoint, body, config);
    return response.data;
  },

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
};

