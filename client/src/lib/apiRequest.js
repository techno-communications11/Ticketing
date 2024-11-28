import axios from 'axios';

export const apiRequest = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`, // Fixed the URL prefix
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
