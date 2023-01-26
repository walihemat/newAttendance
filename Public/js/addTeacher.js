import axios from "axios";
import { showAlert } from "./alerts";

export const addTeacher = async (
  teacherName,
  teacherLastName,
  teacherClass,
  gender,
  email,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name: teacherName,
        lastName: teacherLastName,
        email,
        class: teacherClass,
        gender,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", `Successfully Created ${teacherLastName}'s account`);
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
