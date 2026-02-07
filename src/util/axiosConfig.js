import axios from 'axios';
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Initialize the token from local storage
const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const errorMessage = error.response.data?.message || '';
      localStorage.removeItem('authToken');
      setAuthToken(null);
      if (errorMessage){
        toast.error(errorMessage);
      }
      window.location.href = '/login'; 
    }
    return Promise.reject(error); 
  }
);

export default axiosInstance;
