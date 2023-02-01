import "@babel/polyfill";
import { login } from "./login";
import { logout } from "./login";
import { addStudent, editStudent } from "./addStudent";
import { deleteStudent, removeTeacherStudent } from "./deleteStudent";
import { attendStudent } from "./attendStudent";
import { addTeacher } from "./addTeacher";
import { editTeacher } from "./edit_teacher";
import { deleteTeacher } from "./deleteTeacher";
import { changePassword } from "./changePassword";
import { changeMyProfilePicture } from "./changeProfilePic";

import html2pdf from "html2pdf.js";

const form = document.querySelector(".form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

const logoutBtn = document.querySelector(".logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    logout();
  });
}

const addStudentForm = document.getElementById("addStudent");
if (addStudentForm) {
  addStudentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("studentName").value;
    const Class = document.getElementById("studentClass").value;
    let timeFrom = document.getElementById("classTimeFrom").value;

    let timeTo = document.getElementById("classTimeTo").value;
    const instructor = document.getElementById("studentInstructor").value;

    const selected = [];
    for (const option of document.getElementById("vacation").options) {
      if (option.selected) {
        selected.push(option.value);
      }
    }

    const genders = document.getElementsByName("gender");
    let studentGender = "";
    genders.forEach((gender) => {
      if (gender.checked) {
        studentGender = gender.value;
      }
    });

    addStudent(
      name,
      Class,
      instructor,
      studentGender,
      selected,
      timeFrom,
      timeTo
    );
  });
}

const editStudentForm = document.getElementById("editStudent");
if (editStudentForm) {
  editStudentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("studentName").value;
    const Class = document.getElementById("studentClass").value;
    let timeFrom = document.getElementById("classTimeFrom").value;

    let timeTo = document.getElementById("classTimeTo").value;
    const instructor = document.getElementById("StudentInstructor").value;
    const id = document.getElementById("id").value;

    const selected = [];
    for (const option of document.getElementById("vacation").options) {
      if (option.selected) {
        selected.push(option.value);
      }
    }

    const genders = document.getElementsByName("gender");
    let studentGender = "";
    genders.forEach((gender) => {
      if (gender.checked) {
        studentGender = gender.value;
      }
    });

    editStudent(
      name,
      Class,
      instructor,
      studentGender,
      selected,
      timeFrom,
      timeTo,
      id
    );
  });
}

const deleteStudentBtn = document.querySelectorAll(".deleteStudentBtn");

if (deleteStudentBtn) {
  deleteStudentBtn.forEach((click) => {
    click.addEventListener("click", (e) => {
      deleteStudent(e.target.value);
    });
  });
}

const presentBtn = document.querySelectorAll(".presentBtn");
const studentAbsentBtn = document.querySelectorAll(".studentAbsentBtn");
const teacherAbsentBtn = document.querySelectorAll(".teacherAbsentBtn");

if (presentBtn) {
  presentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "present");
    });
  });
}

if (studentAbsentBtn) {
  studentAbsentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "student absent");
    });
  });
}

if (teacherAbsentBtn) {
  teacherAbsentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "teacher absent");
    });
  });
}

const addTeacherForm = document.getElementById("addTeacher");
const teacherName = document.getElementById("teacherName");
const teacherClass = document.getElementById("teacherClass");
const teacherLastName = document.getElementById("teacherLastName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const passwordConfirm = document.getElementById("passwordConfirm");

if (addTeacherForm) {
  addTeacherForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const genders = document.getElementsByName("gender");
    let studentGender = "";
    genders.forEach((gender) => {
      if (gender.checked) {
        studentGender = gender.value;
      }
    });

    addTeacher(
      teacherName.value,
      teacherLastName.value,
      teacherClass.value,
      studentGender,
      email.value,
      password.value,
      passwordConfirm.value
    );
  });
}

const editTeacherForm = document.getElementById("editTeacher");

if (editTeacherForm) {
  editTeacherForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const teacherId = document.getElementById("teacherId");

    const genders = document.getElementsByName("gender");
    let teacherGender = "";
    genders.forEach((gender) => {
      if (gender.checked) {
        teacherGender = gender.value;
      }
    });

    const selected = [];
    for (const option of document.getElementById("teacherStudents").options) {
      if (option.selected) {
        selected.push(option.value);
      }
    }

    const teacherName = document.getElementById("teacherName").value;
    const teacherLastName = document.getElementById("teacherLastName").value;
    const email = document.getElementById("email").value;
    const teacherClass = document.getElementById("teacherClass").value;

    editTeacher(
      teacherId.value,
      teacherName,
      teacherLastName,
      email,
      teacherClass,
      selected,
      teacherGender
    );
  });
}

const deleteTeacherStudentBtn = document.querySelectorAll(
  ".deleteTeacherStudentBtn"
);
if (deleteTeacherStudentBtn) {
  deleteTeacherStudentBtn.forEach((d) => {
    d.addEventListener("click", (e) => {
      const [teacherId, studentId] = e.currentTarget.value.split(",");

      if (confirm("Are you sure to Remove the student")) {
        removeTeacherStudent(studentId, teacherId);
      }
    });
  });
}

const deleteTeacherBtn = document.querySelectorAll(".deleteTeacherBtn");
if (deleteTeacherBtn) {
  deleteTeacherBtn.forEach((d) => {
    d.addEventListener("click", (e) => {
      if (confirm("Are you sure to Delete the instructor?")) {
        deleteTeacher(e.currentTarget.value);
      }
    });
  });
}

const changePasswordForm = document.getElementById("changePasswordForm");

const currentPassword = document.getElementById("currentPassword");
const chPassword = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    changePassword(
      currentPassword.value,
      chPassword.value,
      confirmPassword.value
    );
  });
}

const generatePdf = (name, contentElement) => {
  let opt = {
    margin: 0.5,
    filename: `TeachTeam ${name}'s salary`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
  };
  html2pdf().from(contentElement).set(opt).save();
};

const teacherCurrentSalaryTable = document.getElementById(
  "teacherCurrentSalaryTable"
);

if (teacherCurrentSalaryTable) {
  const tableTodownloadBtn = document.getElementById(
    "teacherCurrentSalaryDownloadBtn"
  );
  tableTodownloadBtn.addEventListener("click", async (e) => {
    generatePdf("teacher", teacherCurrentSalaryTable);
  });
}

const previousMonthTeacherSalaryTable = document.getElementById(
  "previousMonthTeacherSalaryTable"
);

if (previousMonthTeacherSalaryTable) {
  const downloadBtn = document
    .getElementById("previousMonthTeacherSalaryBtn")
    .addEventListener("click", () => {
      generatePdf("teacher", previousMonthTeacherSalaryTable);
    });
}

const allTeacherSalaryTable = document.getElementById("allTeacherSalaryTable");

if (allTeacherSalaryTable) {
  const downloadBtn = document
    .getElementById("allTeacherSalaryDownloadBtn")
    .addEventListener("click", () => {
      generatePdf("All Teacher", allTeacherSalaryTable);
    });
}

const allTeacherPreviousMonthSalary = document.getElementById(
  "allTeacherPreviousMonthSalary"
);

if (allTeacherPreviousMonthSalary) {
  const downloadBtn = document
    .getElementById("allTeacherPreviousMonthSalaryBtn")
    .addEventListener("click", () => {
      generatePdf("All Teacher", allTeacherPreviousMonthSalary);
    });
}

const changeProfilePicForm = document.getElementById("changeProfilePicForm");

if (changeProfilePicForm) {
  changeProfilePicForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("photo", document.getElementById("profilePicture").files[0]);

    changeMyProfilePicture(form);
  });
}

const currentMonthAttendaceTable = document.getElementById(
  "currentMonthAttendaceTable"
);

if (currentMonthAttendaceTable) {
  document
    .getElementById("currentMonthAttendaceTableDownloadBtn")
    .addEventListener("click", () => {
      generatePdf("Current Month Attendance", currentMonthAttendaceTable);
    });
}

const previousMonthAttendaceTable = document.getElementById(
  "previousMonthAttendaceTable"
);

if (previousMonthAttendaceTable) {
  document
    .getElementById("previousMonthAttendaceTableDownloadBtn")
    .addEventListener("click", () => {
      generatePdf("Previous Month Attendance", previousMonthAttendaceTable);
    });
}

const adpresentBtn = document.querySelectorAll(".adpresentBtn");
const adstudentAbsentBtn = document.querySelectorAll(".adstudentAbsentBtn");
const adteacherAbsentBtn = document.querySelectorAll(".adteacherAbsentBtn");

if (adpresentBtn) {
  adpresentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "present");
    });
  });
}

if (adstudentAbsentBtn) {
  adstudentAbsentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "student absent");
    });
  });
}

if (adteacherAbsentBtn) {
  adteacherAbsentBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      attendStudent(id, "teacher absent");
    });
  });
}

const display12HoursTime = (hour, minute, seconds) => {
  let dd = "AM";
  let h = hour;
  if (h >= 12) {
    h = hour - 12;
    dd = "PM";
  }
  if (h == 0) {
    h = 12;
  }
  return h < 10
    ? "0" + h + " : " + minute + " : " + seconds + " " + dd + " :: " + new Date().getUTCMonth() + " / " +  new Date().getUTCDate() + " / " + new Date().getUTCFullYear()
    : h + " : " + minute + " : " + seconds + " " + dd+ " :: " + new Date().getUTCMonth() + " / " +  new Date().getUTCDate() + " / " + new Date().getUTCFullYear()
};

const digitalClock = ()=> {
  const d = new Date();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  return display12HoursTime(hour, minute, seconds);
}

const digitalClockPara = document.getElementById('digitalClock');

if(digitalClockPara){
  window.setInterval(()=> {
    digitalClockPara.textContent = digitalClock();
  })
}