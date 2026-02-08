// const API_BASE_URL = "https://camp-coding.tech/wady-way/admin";

import axios from "axios";
import { base_url } from "./base_url";

export const loginAPI = async (email, password) => {
  const response = await axios.post(
    `${base_url}/admin/admin_users/admin_login.php`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      email,
      password,
    }
  );

  return response;
};

export const isAuthenticated = () => {
  return localStorage.getItem("admin_data") !== null;
};

export const getAdminData = () => {
  const data = localStorage.getItem("admin_data");
  return data ? JSON.parse(data) : null;
};

export const logout = () => {
  localStorage.removeItem("admin_data");
  localStorage.removeItem("admin_email");
  window.location.href = "/login";
};
