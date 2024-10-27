import axios from 'axios';

export const apiRequest = axios.create({
  baseURL: 'http://192.168.1.27:4000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
