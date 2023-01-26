import axios from "axios";
import { showAlert } from "./alerts";

export const deleteTeacher = async (id) => {
  console.log(id);
  try {
    const res = await axios({
      method: "DELETE",
      url: `http://127.0.0.1:8000/api/v1/users/deleteTeacher/${id}`,
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
