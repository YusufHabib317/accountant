import axios from 'axios';

export const ApiClient = axios.create({
  baseURL: '/api',
});
