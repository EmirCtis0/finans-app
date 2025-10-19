import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // backend hazır olduğunda burayı Yusuf'un API linkiyle güncelleyeceğiz
  timeout: 5000,
});

export default api;
