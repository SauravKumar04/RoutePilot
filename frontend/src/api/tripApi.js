import axiosClient from './axiosClient';

export const createTrip = async (tripData) => {
  return await axiosClient.post('/trips', tripData);
};

export const fetchMyTrips = async () => {
  return await axiosClient.get('/trips');
};

export const fetchTripById = async (id) => {
  return await axiosClient.get(`/trips/${id}`);
};

export const updateTrip = async ({ id, tripData }) => {
  return await axiosClient.put(`/trips/${id}`, tripData);
};

export const optimizeTripRouteApi = async (id) => {
  return await axiosClient.post(`/trips/${id}/optimize`);
};