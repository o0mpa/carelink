import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('carelink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('carelink_token');
      localStorage.removeItem('carelink_role');
      localStorage.removeItem('carelink_profile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// import axios from 'axios';
// import { getToken, clearAuth } from '~/utils/auth';

// const apiClient = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// apiClient.interceptors.request.use(
//   (config) => {
//     const token = getToken(); 
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       clearAuth(); 
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;