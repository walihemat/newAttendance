import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 5000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });
    if (res.data.status == "success") {
      showAlert("success", "Logged out successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 3000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
