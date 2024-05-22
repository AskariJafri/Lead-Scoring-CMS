// Create a custom hook for authentication
export const useAuth = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  return isAuthenticated;
};

export const destroyToken = () => {
  localStorage.removeItem("token"); // Assuming you're using localStorage for token storage
};
export const getToken = () => {
  return localStorage.getItem("token");
};
export const getUsername = () => {
  return localStorage.getItem("username");
};
