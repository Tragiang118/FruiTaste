import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ log lỗi hệ thống (5xx) hoặc lỗi mạng không có response
    // Các lỗi logic (4xx) sẽ được xử lý tại component
    if (!error.response || error.response.status >= 500) {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;