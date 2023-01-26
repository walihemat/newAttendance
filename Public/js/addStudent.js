import axios from "axios";
import { showAlert } from "./alerts";

export const addStudent = async (
  Name,
  Class,
  teacher,
  gender,
  vacation,
  timeFrom,
  timeTo
) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/attendance",
      data: {
        name: Name,
        class: Class,
        teacher,
        gender,
        vacation,
        timeFrom,
        timeTo,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Student added successfully!");
      window.setTimeout(() => {
        location.reload(true);
      }, 5000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};

export const editStudent = async (
  Name,
  Class,
  teacher,
  gender,
  vacation,
  timeFrom,
  timeTo,
  id
) => {
  console.log(Name, Class, teacher, gender, vacation, timeFrom, timeTo, id);
  try {
    const res = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/v1/attendance/${id}`,
      data: {
        name: Name,
        class: Class,
        teacher,
        gender,
        vacation,
        timeFrom,
        timeTo,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "updated successfully!");
      window.setTimeout(() => {
        location.reload(true);
      }, 5000);
    }
  } catch (err) {
    showAlert("danger", err.response.data.message);
  }
};
