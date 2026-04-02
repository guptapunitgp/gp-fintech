import axios from "axios";

const api = axios.create({
  baseURL: "https://gp-fintech.onrender.com/api",
});

export default api;