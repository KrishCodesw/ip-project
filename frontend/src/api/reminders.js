import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:3001/api/reminders' });

export const getReminders = (token) => API.get('/', { headers: { Authorization: `Bearer ${token}` } });
export const createReminder = (data, token) => API.post('/', data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteReminder = (id, token) => API.delete(`/${id}`, { headers: { Authorization: `Bearer ${token}` } });
