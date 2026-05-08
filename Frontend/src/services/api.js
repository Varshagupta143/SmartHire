import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    let msg;
    if (typeof data === "string" && data.length > 0) msg = data;
    else if (data && typeof data === "object") msg = data.message || data.error || JSON.stringify(data);
    else msg = err.message || "An error occurred";
    return Promise.reject(new Error(msg));
  }
);

export default API;
