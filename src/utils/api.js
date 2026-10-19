import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const productAPI = {
    getAll: () => API.get('/products'),
    getOne: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
    createReview: (id, data) => API.post(`/products/${id}/reviews`, data),
    uploadImage: (formData) => API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadMultipleImages: (formData) => API.post('/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const authAPI = {
    login: (credentials) => API.post('/auth/login', credentials),
    getProfile: () => API.get('/auth/profile'),
};

export const settingsAPI = {
    get: () => API.get('/settings'),
    update: (data) => API.put('/settings', data),
};

export default API;