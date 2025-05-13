import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
});

export const loginRequest = async (username: string, password: string) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};

export const getSentence = async (hash: string) => {
  const response = await api.get(`/sentencia/${hash}`);
  return response.data;
};

export const updateSentence = async (hash: string, sentence: string) => {
  const response = await api.put(`/sentencia/${hash}`, { sentence });
  return response.data;
};

export const requestChanges = async (hash: string, feedback: string) => {
  const response = await api.post(`/sentencia/${hash}/request-changes`, {
    changes: feedback,
  });
  return response.data;
};
