import axios from "axios";
import { showAlert } from "./alerts";

export const deleteStudent = async (id) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `http://127.0.0.1:8000/api/v1/attendance/${id}`,
    });
  } catch (err) {
    if (err.response.data.status === "success") {
      showAlert("success", "Deleted successfully!");
      window.setTimeout(() => {
        location.reload(true);
      }, 3000);
    } else {
      showAlert("danger", err.response.data.message);
      window.setTimeout(() => {
        location.reload(true);
      });
    }
  }
};

// Remove a student from teacher
export const removeTeacherStudent = async (id, teacherId) => {
  try {
    const res = await axios({
      method: "POST",
      url: `http://127.0.0.1:8000/api/v1/attendance/removeTeacherStudent/${id}`,
      data: {
        teacherId,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Student successfully removed!");
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
