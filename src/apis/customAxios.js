import axios from "axios";
import { API_ROOT } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: `${API_ROOT}`, // Thay bằng API của bạn
  timeout: 10000, // 10 giây timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor Request: Gửi token nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor Response: Bắt lỗi từ API
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Lỗi từ server (status code khác 2xx)
      console.log(error.response);
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Lỗi 400: Bad Request", data);
          break;
        case 401:
          console.error("Lỗi 401: Unauthorized");
          // Xử lý logout hoặc refresh token nếu cần
          break;
        case 403:
          console.error("Lỗi 403: Forbidden");
          break;
        case 404:
          console.error("Lỗi 404: Not Found");
          break;
        case 500:
          console.error("Lỗi 500: Internal Server Error");
          break;
        default:
          console.error(`Lỗi ${status}:`, data);
      }
    } else if (error.request) {
      // Lỗi không có response (timeout, server không phản hồi)
      console.error("Không có phản hồi từ server. Vui lòng kiểm tra mạng!");
    } else {
      // Lỗi khác
      console.error("Lỗi không xác định:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
