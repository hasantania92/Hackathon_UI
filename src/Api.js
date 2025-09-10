import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // your Spring Boot backend
});

export const uploadDocument = (formData) =>
  API.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchSolutions = () => API.get("/solutions");

export const addSolution = (solution) => API.post("/solutions/add", solution);

export const chatWithAI = (message) =>
  API.post("/ai/chat", { query: message });

export const checkCompliance = (solutionId) =>
  API.get(`/compliance/${solutionId}`);
