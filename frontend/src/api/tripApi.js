import axiosClient from './axiosClient';

export const createTrip = (tripData) => {
  return axiosClient.post('/trips', tripData);
};

export const fetchMyTrips = () => {
  return axiosClient.get('/trips');
};

export const fetchTripById = (id) => {
  return axiosClient.get(`/trips/${id}`);
};

export const updateTrip = ({ id, tripData }) => {
  return axiosClient.put(`/trips/${id}`, tripData);
};

export const optimizeTripRouteApi = (id) => {
  return axiosClient.post(`/trips/${id}/optimize`);
};