import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

export const getAssignments = () => API.get("/assignments/getassignment");

export const getAssignment = (id) =>
  API.get(`/assignments/getassignmentbyId/${id}`);

export const executeQuery = (data) =>
  API.post("/query/execute", data);

export const getHint = (data) =>
  API.post("/query/hint", data);

export const signup = (data) =>
  API.post("/auth/signup", data);

export const login = (data) =>
  API.post("/auth/login", data);

export const logout = () =>
  API.get("/auth/logout");

export const getMe = () =>
  API.get("/auth/user-info");
