import axios from "axios";
const DEV_MODE = false;

export const api = axios.create({
  baseURL: DEV_MODE ? "http://localhost:8005/api/v1" : "/api/v1",
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

export const generateSentenceBrief = async (formData: FormData) => {
  try {
    const response = await api.post(`/generate-sentence-brief`, formData);
    console.log("response RECIBIDA", response);
    return response.data;
  } catch (error) {
    console.error("Error al generar resumen de la sentencia:", error);
    throw new Error("Hubo un error al generar el resumen de la sentencia");
  }
};
