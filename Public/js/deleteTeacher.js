import axios from "axios";
import { showAlert } from "./alerts";

export const deleteTeacher = async (id) => {
  console.log(id);
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/users/deleteTeacher/${id}`,
    });
    if (res.data.status === "success") {
      showAlert("success", "Teacher successfully Deleted!");
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
