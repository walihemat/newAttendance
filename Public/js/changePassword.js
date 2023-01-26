import axios from "axios";
import { showAlert } from "./alerts";

export const changePassword = async (
  currentPassword,
  chPassword,
  confirmPassword
) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/updatePassword",
      data: {
        currentPassword,
        password: chPassword,
        passwordConfirm: confirmPassword,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Updated Successfully!");
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
