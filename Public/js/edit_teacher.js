import axios from "axios";
import { showAlert } from "./alerts";

export const editTeacher = async (
  id,
  teacherName,
  teacherLastName,
  email,
  teacherClass,
  selected,
  teacherGender
) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/v1/users/updateMe/${id}`,
      data: {
        teacherName,
        teacherLastName,
        email,
        teacherClass,
        selected,
        teacherGender,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Teacher's account successfully updated!");
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
