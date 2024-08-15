import axios from 'axios';


// const API_BASE_URL = 'http://localhost:8000'; // Replace with your backend API URL
const VITE_API_URL = import.meta.env.VITE_API_URL;


// Create an Axios instance
const api = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Remove the 'Expect' header if it exists
    delete config.headers['Expect'];
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


// Function to handle generic API requests
export const apiRequest = async (method, endpoint, data = null) => {
  const config = {
    method: method,
    url: endpoint,
    data: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error; 
  }
};