import axios from "axios";

const API_URL = "http://192.168.1.2:3000/api";

export const api = async (path: string, options: any = {}) => {
  const token = await getToken();
  try {
    // Axios usa 'data' en lugar de 'body'
    const { body, ...restOptions } = options;
    const response = await axios({
      url: `${API_URL}${path}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
      data: body, // Convertir 'body' a 'data' para axios
      ...restOptions,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const getToken = async () => {
  try {
    const data = await import("@react-native-async-storage/async-storage");
    const token = await data.default.getItem("authToken");
    return token;
  } catch {
    return null;
  }
};
