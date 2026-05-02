import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:3000/api', // baseURL tanpa /v1, nanti dipanggil dengan /v1/...
});

// --- Request Interceptor: tambahkan token ke setiap request ---
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Response Interceptor (opsional): jika 401, redirect ke login ---
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired / tidak valid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;