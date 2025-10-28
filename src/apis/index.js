import axios from "axios";
import axiosClient from "./customAxios";
import { API_ROOT } from "../utils/constants";

export const fetchBoardDetailsAPI = async (boardId) => {
  const res = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  return res.data;
};

export const fetchBoardData = async (boardId) => {
  try {
    const response = await axiosClient.get(`/v1/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const updateBoardData = async (boardId, updateData) => {
  try {
    const response = await axiosClient.put(`/v1/boards/${boardId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const invite = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/boards/invite`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const moveCardToDifferentColumnId = async (updateData) => {
  try {
    const response = await axiosClient.put(
      `/v1/boards/supports/moving_card`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const updateColumnData = async (columnId, updateData) => {
  try {
    const response = await axiosClient.put(
      `/v1/columns/${columnId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const deleteColumnData = async (columnId) => {
  try {
    const response = await axiosClient.delete(`/v1/columns/${columnId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const deleteUserBoard = async (data) => {
  try {
    const response = await axiosClient.delete(`/v1/boards/deleteUser`, {
      data: data,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const deleteCard = async (columnId, cardId) => {
  try {
    const response = await axiosClient.delete(`/v1/cards/delete`, {
      data: { columnId, cardId },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.response?.data || error);
    throw error;
  }
};

export const deleteBoard = async (deleteBoardId, userId) => {
  try {
    const response = await axiosClient.delete(`/v1/boards/delete`, {
      data: { boardId: deleteBoardId, userId }, // 👈 Phải đặt data trong object
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.response?.data || error);
    throw error;
  }
};

export const createNewColumnAPI = async (newColumnData) => {
  try {
    const response = await axiosClient.post(`/v1/columns`, newColumnData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const createNewCardAPI = async (newCardData) => {
  try {
    const response = await axiosClient.post(`/v1/cards`, newCardData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const createNewUserAPI = async (newUserData) => {
  try {
    const response = await axiosClient.post(`/v1/users`, newUserData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const loginAPI = async (newUserData) => {
  try {
    const response = await axiosClient.post(`/v1/users/login`, newUserData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosClient.post(`/v1/forgot-password`, email);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const addUserIntoCard = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/cards/addUser`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const deleteUserCard = async (data) => {
  try {
    const response = await axiosClient.delete(`/v1/cards/deleteUser`, {
      data: data,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const resetPassword = async (id, password) => {
  try {
    const response = await axiosClient.post(
      `/v1/forgot-password/${id}`,
      password
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const updateTitleAPI = async (data) => {
  try {
    const response = await axiosClient.put(`/v1/columns/update`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const createBoardTitleAPI = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/boards`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosClient.get(`/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const updateCard = async (data) => {
  try {
    const response = await axiosClient.put(`/v1/cards/update`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
