import axiosClient from './axiosClient';

export const loginUser = (credentials) => {
  return axiosClient.post('/auth/login', credentials);
};

export const registerUser = (userData) => {
  return axiosClient.post('/auth/register', userData);
};