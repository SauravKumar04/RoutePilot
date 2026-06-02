import axiosClient from './axiosClient';

export const loginUser = async (credentials) => {
  return await axiosClient.post('/auth/login', credentials);
};

export const registerUser = async (userData) => {
  return await axiosClient.post('/auth/register', userData);
};

export const fetchCurrentUser = async () => {
  return await axiosClient.get('/auth/me');
};