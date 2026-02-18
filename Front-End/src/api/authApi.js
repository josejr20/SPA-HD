import apiClient from "./axiosConfig";
import { jwtDecode } from 'jwt-decode';

export const login = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUserIdFromToken = () => {
  const token = getToken();
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId || null;
      if (!userId) {
          console.warn("Could not find 'sub' or 'userId' claim in token.");
      }
      return userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

// Agregar esta función en /src/api/authApi.js

export const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      username: payload.sub,
      email: payload.email, // Si tu JWT incluye email
      role: payload.role
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};