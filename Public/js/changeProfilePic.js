import axios from "axios";
import { showAlert } from "./alerts";

export const changeMyProfilePicture = async (data) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:8000/api/v1/users/changeMyProfilePicture",
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", "Profile Pc Successfully Updated!");
      window.setTimeout(() => {
        location.reload(true);
      }, 3000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
