import axios from 'axios';

export const apiRequest = axios.create({
  baseURL: 'http://localhost:4000/api', // Fixed the URL prefix
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
