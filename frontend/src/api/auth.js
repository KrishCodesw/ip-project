import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:3001/api/auth' });

export const login = (data) => API.post('/login', data);
export const register = (data) => API.post('/register', data);
export const getUser = (token) => API.get('/user', { headers: { Authorization: `Bearer ${token}` } });
