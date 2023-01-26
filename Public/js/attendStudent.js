import axios from "axios";
import { showAlert } from "./alerts";

export const attendStudent = async (id, attended) => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/attendance/attendStudents/${id}`,
      data: {
        attended,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", `Successfully added: ${attended}`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
