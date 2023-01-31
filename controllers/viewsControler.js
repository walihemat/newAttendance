const cron = require("node-cron");
const fs = require("fs");

const Teacher = require("./../models/teacherModel");
const Student = require("./../models/attendanceModel");
const catchAsync = require("./../utils/catchAsync");
const AppErorr = require("./../utils/appError");

const getPreviousMonth= ()=>{
  var d = new Date();
  var newMonth = d.getMonth() - 1;

  if (newMonth < 0) {
    newMonth += 12;
    d.setYear(d.getFullYear() - 1); // use getFullYear instead of getYear !
  }
  const previusMonth = new Date(d.setMonth(newMonth));
  return previusMonth
}

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tour data from collection
  const teachers = await Teacher.find({ role: "teacher" });
  // 2) Build template

  // 3) Render that using tour data from 1
  res.status(200).render("overview", {
    title: "All Teachers",
    teachers,
  });
});

exports.getAllTeachers = catchAsync(async (req, res, next) => {
  // 1) get teachers data from collection
  let teachers = await Teacher.find({ role: "teacher" });
  let result;
  let allTeacherSearch = "";

  // 2) check if there is search for teacher by user
  let searchedTeachers = [];

  if (
    req.query.allTeacherSearch != undefined &&
    req.query.allTeacherSearch != ""
  ) {
    allTeacherSearch = req.query.allTeacherSearch;
  }

  if (req.query.allTeacherSearch) {
    if (teachers.length > 0) {
      searchedTeachers = teachers.filter((teacher) => {
        if (
          teacher.name
            .toLowerCase()
            .includes(req.query.allTeacherSearch.toLowerCase())
        ) {
          return teacher;
        }
      });
    }
  }

  if (
    req.query.allTeacherSearch != undefined &&
    req.query.allTeacherSearch != "" &&
    searchedTeachers.length == 0
  ) {
    result = "No match!";
  }

  if (searchedTeachers.length > 0) {
    teachers = searchedTeachers;
  }

  if (
    req.query.allTeacherSearch != undefined &&
    req.query.allTeacherSearch == ""
  ) {
    res.redirect("/teachers");
    return;
  }

  // 3) Render that using tour data from 1
  res.status(200).render("teachers", {
    title: "All Teachers",
    teachers,
    result,
    allTeacherSearch,
  });
});

exports.getTeacher = catchAsync(async (req, res, next) => {
  let page = "edit_teacher";
  if (req.url.startsWith("/teacher_info")) {
    page = "teacher_info";
  }
  // 1) get the data, for the requested teacher
  const teacher = await Teacher.findById(req.params.id).populate({
    path: "students",
  });

  if (!teacher) {
    return next(new AppErorr("No Teacher found with this Id", 404));
  }

  const Allstudents = await Student.find();

  // Get teacher students
  const students = teacher.students;
  // 3) Render template using the data from 1
  res.status(200).render(page, {
    title: page,
    teacher,
    students,
    Allstudents,
  });
});

exports.getStudents = catchAsync(async (req, res, next) => {
  let students = await Student.find();

  const teachers = await Teacher.find({ role: "teacher" });
  let result;
  let allStudentSearch = "";
  if (req.query.allStudentSearch && req.query.allStudentSearch != "") {
    allStudentSearch = req.query.allStudentSearch;
  }

  students.forEach((student) => {
    teachers.forEach((teacher) => {
      if (student.teacher[0] == teacher._id.toString()) {
        student["teacherName"] = teacher.name;
      }
    });
  });

  let searchedStudents = [];

  if (req.query.allStudentSearch) {
    if (students.length > 0) {
      searchedStudents = students.filter((student) => {
        if (
          student.name
            .toLowerCase()
            .includes(req.query.allStudentSearch.toLowerCase())
        ) {
          return student;
        }
      });
    }
  }

  if (searchedStudents.length > 0) {
    students = searchedStudents;
  }

  if (
    req.query.allStudentSearch != undefined &&
    req.query.allStudentSearch != "" &&
    searchedStudents.length == 0
  ) {
    result = "No match!";
  }

  if (
    req.query.allStudentSearch != undefined &&
    req.query.allStudentSearch == ""
  ) {
    res.redirect("/students");
    return;
  }

  res.status(200).render("students", {
    title: "All students",
    students,
    allStudentSearch,
    result,
  });
});


exports.getStudent = catchAsync(async (req, res, next) => {
  let previusMonth = getPreviousMonth();
  let page = "edit_student";
  if (req.url.startsWith("/student_info")) {
    page = "student_info";
  }
  

  const student = await Student.findById(req.params.id);

  const teacher = await Teacher.findById(student.teacher[0]);

  const teachers = await Teacher.find({ role: "teacher" });
  const attendancePreAndCurMonth = [];
  if (page === "student_info") {
    student.attendance.date.forEach((date, i) => {
      if (
        new Date(date).getMonth() === previusMonth.getMonth() &&
        new Date(date).getFullYear() === previusMonth.getFullYear()
      ) {
        attendancePreAndCurMonth.push({
          date,
          attended: student.attendance.attended[i],
        });
      }

      if (
        new Date(date).getMonth() === new Date().getMonth() &&
        new Date(date).getFullYear() === new Date().getFullYear()
      ) {
        attendancePreAndCurMonth.push({
          date,
          attended: student.attendance.attended[i],
        });
      }
    });
  }
  student["curtPreMonthAtte"] = attendancePreAndCurMonth;

  res.status(200).render(page, {
    title: student ? student.name : "Student Information",
    student,
    teacher,
    teachers,
  });
});

exports.login = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
    message: "successfully logged in",
  });
};

exports.getTodayAttendedStudents = catchAsync(async (req, res, next) => {
  
  let students = await Student.find().populate({
    path: "teacher",
    select: "name",
  });

  let searchedStudents = [];

  let result;

  let adInputSearch = "";
  if (req.query.adInputSearch != undefined) {
    adInputSearch = req.query.adInputSearch;
  }

  let attendedStudents = [];
  // if (searchedStudents.length > 0) {
  //   students = searchedStudents;
  // }
  students.forEach((student) => {
    student.attendance.date.map((attend, i) => {
      if (
        new Date(attend).getDate() == new Date().getDate() &&
        new Date(attend).getMonth() == new Date().getMonth() &&
        new Date(attend).getFullYear() == new Date().getFullYear()
      ) {
        attendedStudents.push({
          date: attend,
          todayAttendance: student.attendance.attended[i],
          ...student._doc,
        });
      }
    });
  });

  if (req.query.adInputSearch) {
    if (attendedStudents.length > 0) {
      attendedStudents = attendedStudents.filter((student) => {
        if (
          student.name
            .toLowerCase()
            .includes(req.query.adInputSearch.toLowerCase())
        ) {
          return student;
        }
      });
    }
  }

  if (req.query.adInputSearch != undefined && attendedStudents.length == 0) {
    result = "No match!";
  }

  if (req.query.adInputSearch == "") {
    res.redirect("/admin_dashboard");
    return;
  }

  res.status(200).render("admin_dashboard", {
    title: "Attended Students",
    attendedStudents,
    result,
    adInputSearch,
  });
});

const display12HoursTime = (hour, minute) => {
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
    ? "0" + h + ":" + minute + " " + dd
    : h + ":" + minute + " " + dd;
};

exports.teacherAttendStudents = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id).populate({
    path: "students",
    select: "",
  });

  let students = teacher.students;
  // let [...newStudents] = students;

  let searchedStudents = [];
  let inputSearch = "";
  if (req.query.inputSearch) inputSearch = req.query.inputSearch;

  if (req.query.inputSearch != undefined || req.query.inputSearch != "") {
    searchedStudents = students.filter((student) => {
      if (
        req.query.inputSearch != undefined &&
        student.name.toLowerCase().includes(req.query.inputSearch.toLowerCase())
      ) {
        return student;
      }
    });
  }
  let result;

  if (req.query.inputSearch != undefined && searchedStudents.length == 0) {
    result = "No match!";
  }

  const attendedStudents = [];
  if (searchedStudents.length > 0) students = searchedStudents;
  students.forEach((student) => {
    student["startClass"] = display12HoursTime(
      +student.timeFrom.split(":")[0],
      +student.timeFrom.split(":")[1]
    );
    student["endClass"] = display12HoursTime(
      +student.timeTo.split(":")[0],
      +student.timeTo.split(":")[1]
    );
    student.attendance.date.forEach((attend, i) => {
      if (
        new Date(attend).getDate() == new Date().getDate() &&
        new Date(attend).getMonth() == new Date().getMonth() &&
        new Date(attend).getFullYear() == new Date().getFullYear()
      ) {
        attendedStudents.push({
          date: attend,
          attended: student.attendance.attended[i],
          id: student._id,
          name: student.name,
          timeFrom: student.timeFrom,
          timeTo: student.timeTo,
          teacher: student.teacher,
          vacation: student.vacation,
          gender: student.gender,
          class: student.class,
          slug: student.slug,
          attendance: student.attendance,
          startClass: student.startClass,
          endClass: student.endClass,
        });
      }
    });

    if (
      new Date(
        student.attendance.date[student.attendance.date.length - 1]
      ).getDate() != new Date().getDate() ||
      new Date(
        student.attendance.date[student.attendance.date.length - 1]
      ).getMonth() != new Date().getMonth()
    ) {
      attendedStudents.push({
        id: student._id,
        name: student.name,
        timeFrom: student.timeFrom,
        timeTo: student.timeTo,
        teacher: student.teacher,
        vacation: student.vacation,
        gender: student.gender,
        class: student.class,
        slug: student.slug,
        attendance: student.attendance,
        startClass: student.startClass,
        endClass: student.endClass,
      });
    }
  });
  const newStudents = attendedStudents;
  if (req.query.inputSearch == "") {
    res.redirect(`/teacher_dashboard/${req.params.id}`);
    return;
  }

  res.status(200).render("teacher_dashboard", {
    title: "Attend Students",
    newStudents,
    teacher,
    inputSearch,
    result,
  });
});

exports.addStudent = catchAsync(async (req, res, next) => {
  const teachers = await Teacher.find({ role: "teacher" });

  res.status(200).render("add_student", {
    title: "Add student",
    teachers,
  });
});

exports.addTeacher = catchAsync(async (req, res, next) => {
  const teachers = await Teacher.find();
  res.status(200).render("add_teacher", {
    title: "Add teacher",
    teachers,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  res.status(200).render("changePassword", {
    title: "Change Password",
  });
});

exports.getTeacherSalary = catchAsync(async (req, res, next) => {
  const currentMonthSalary = [];

  const teacher = await Teacher.findById(req.params.id);

  teacher.salary.salaryDate.forEach((date, i) => {
    if (
      new Date(date).getMonth() == new Date().getMonth() &&
      new Date(date).getFullYear() == new Date().getFullYear()
    ) {
      currentMonthSalary.push({
        name: teacher.name,
        lastName: teacher.lastName,
        totalHours: teacher.salary.totalPresent[i],
        totalClasses: teacher.salary.totalClasses[i],
        salaryAmount: teacher.salary.salaryAmount[i],
        date: date,
      });
    }
  });

  res.status(200).render("teacherSalary", {
    title: "Teacher Salary",
    salaryStudentBased: teacher.studentsAttendanceTotal,
    currentMonthSalary,
    teacher,
  });
});

exports.getTeacherSalaryPreviousMonth = catchAsync(async (req, res, next) => {

  let previusMonth = getPreviousMonth();

  const teacher = await Teacher.findById(req.params.id);

  teacher.salary.salaryDate.forEach((date, i) => {
    if (
      new Date(date).getMonth() == previusMonth.getMonth() &&
      new Date(date).getFullYear() == previusMonth.getFullYear()
    ) {
      previousMonthSalary.push({
        name: teacher.name,
        lastName: teacher.lastName,
        totalHours: teacher.salary.totalPresent[i],
        totalClasses: teacher.salary.totalClasses[i],
        salaryAmount: teacher.salary.salaryAmount[i],
        date: date,
      });
    }
  });

  res.status(200).render("teacherSalaryPreviousMonth", {
    title: "Teacher Salary",
    previousMonthSalary,
    teacher,
  });
});

const caculateTeacherSalaryAutomatically = catchAsync(async () => {
  // var d = new Date();
  // var newMonth = d.getMonth() - 1;

  // if (newMonth < 0) {
  //   newMonth += 12;
  //   d.setYear(d.getFullYear() - 1); // use getFullYear instead of getYear !
  // }
  // const previusMonth = new Date(d.setMonth(newMonth));

  let previusMonth = getPreviousMonth();

  const teachers = await Teacher.find({ role: "teacher" }).populate({
    path: "students",
  });

  teachers.forEach((teacher) => {
    if (teacher.students.length > 0) {
      teacher.students.forEach((student) => {
        student["present"] = 0;
        student["absent"] = 0;
        let presentCount = 1;
        let absentCount = 1;
        student.attendance.date.forEach((date, i) => {
          if (
            new Date(date).getFullYear() === new Date().getFullYear() &&
            new Date(date).getMonth() === new Date().getMonth()
          ) {
            if (
              student.attendance.attended[i] === "present" ||
              student.attendance.attended[i] === "student absent"
            ) {
              student.present = presentCount;
              presentCount++;
            }
            if (student.attendance.attended[i] === "teacher absent") {
              student.absent = absentCount;
              absentCount++;
            }
          }
        });
      });
    }
  });

  teachers.forEach((teacher) => {
    let teacherSalary = [];
    const teacherStudentsIds = teacher.students.map((tchStudent) =>
      tchStudent._id.toString()
    );
    teacher.studentsAttendanceTotal.forEach((stAtTo, i) => {
      if (
        !teacherStudentsIds.includes(stAtTo.id.toString()) &&
        new Date(stAtTo.date).getMonth() === new Date().getMonth() &&
        new Date(stAtTo.date).getFullYear() === new Date().getFullYear()
      ) {
        teacherSalary.push(stAtTo);
      }
      if (
        !teacherStudentsIds.includes(stAtTo.id.toString()) &&
        new Date(stAtTo.date).getMonth() == previusMonth.getMonth() &&
        new Date(stAtTo.date).getFullYear() == previusMonth.getFullYear()
      ) {
        teacherSalary.push(stAtTo);
      }
      if (
        new Date(stAtTo.date).getMonth() !== new Date().getMonth() &&
        new Date(stAtTo.date).getMonth() !== previusMonth.getMonth()
      ) {
        teacher.studentsAttendanceTotal.splice(i, 1);
      }
    });

    teacher.students.forEach((sstudent) => {
      teacherSalary.push({
        name: sstudent.name,
        id: sstudent._id,
        present: sstudent.present,
        absent: sstudent.absent,
        date: new Date(),
      });
    });
    teacher.studentsAttendanceTotal = teacherSalary;
    teacher.save({ validateBeforeSave: false });
  });
});

// caculateTeacherSalaryAutomatically();

const secondPartOfAutomateSalaryCalculate = async () => {

  let previusMonth = getPreviousMonth();

  const teachers = await Teacher.find({ role: "teacher" });

  teachers.forEach(async (teacher) => {
    const [...salaryDate] = teacher.salary.salaryDate;
    const [...salaryAmount] = teacher.salary.salaryAmount;
    const [...allPresent] = teacher.salary.totalPresent;
    const [...totalClasses] = teacher.salary.totalClasses;

    const totalPresent = [];
    teacher.studentsAttendanceTotal.forEach((salaryStudent) => {
      if (
        new Date(salaryStudent.date).getMonth() == new Date().getMonth() &&
        new Date(salaryStudent.date).getFullYear() == new Date().getFullYear()
      ) {
        totalPresent.push(salaryStudent.present);
      }
    });

    // const teacherTotalClasseNumbers = [];
    // teacher.studentsAttendanceTotal.forEach((totalClassStudent) => {
    //   if (
    //     new Date(totalClassStudent.date).getMonth() == new Date().getMonth() &&
    //     new Date(totalClassStudent.date).getFullYear() ==
    //       new Date().getFullYear()
    //   ) {
    //     teacherTotalClasseNumbers.push(totalClassStudent);
    //   }
    // });

    let totalSalary = [];

    if (totalPresent.length > 1) {
      const sumOftotalPresent = totalPresent.reduce((acc, p) => {
        return acc + p;
      });
      totalSalary.push(sumOftotalPresent);
    }
    if (totalPresent.length == 1) {
      totalSalary.push(totalPresent[0]);
    }

    if (teacher.salary.salaryDate.length > 0) {
      if (
        new Date(
          teacher.salary.salaryDate[teacher.salary.salaryDate.length - 1]
        ).getMonth() === new Date().getMonth() &&
        new Date(
          teacher.salary.salaryDate[teacher.salary.salaryDate.length - 1]
        ).getFullYear() === new Date().getFullYear()
      ) {
        salaryAmount[salaryAmount.length - 1] = totalSalary * 100;

        salaryDate[salaryDate.length - 1] = new Date();
        if (totalSalary.length > 0) {
          allPresent[allPresent.length - 1] = totalSalary[0];
        }
        if (totalSalary.length == 0) {
          allPresent[allPresent.length - 1] = 0;
        }
        if (totalPresent.length > 0) {
          totalClasses[totalClasses.length - 1] = totalPresent.length;
        } else {
          totalClasses[totalClasses.length - 1] = 0;
        }
      } else {
        salaryAmount.push(totalSalary * 100);
        salaryDate.push(new Date());
        if (totalSalary.length > 0) {
          allPresent.push(totalSalary[0]);
        } else {
          allPresent.push(0);
        }
        if (totalPresent.length > 0) {
          totalClasses.push(totalPresent.length);
        } else {
          totalClasses.push(0);
        }
      }
    }
    if (teacher.salary.salaryDate.length == 0) {
      salaryAmount.push(totalSalary[0] * 100);
      salaryDate.push(new Date());
      if (totalSalary.length > 0) {
        allPresent.push(totalSalary[0]);
      } else {
        allPresent.push(0);
      }
      if (totalPresent.length > 0) {
        totalClasses.push(totalPresent.length);
      } else {
        totalClasses.push(0);
      }
    }

    if (teacher.salary.salaryDate.length > 0) {
      teacher.salary.salaryDate.forEach((slDate, I) => {
        if (
          new Date(slDate).getMonth() !== new Date().getMonth() &&
          new Date(slDate).getMonth() !== previusMonth.getMonth()
        ) {
          salaryDate.splice(I, 1);
          salaryAmount.splice(I, 1);
          allPresent.splice(I, 1);
          totalClasses.splice(I, 1);
        }
      });
    }

    (teacher.salary.totalClasses = totalClasses),
      (teacher.salary.salaryAmount = salaryAmount);
    teacher.salary.salaryDate = salaryDate;
    teacher.salary.totalPresent = allPresent;

    teacher.save({ validateBeforeSave: false });
  });
};

exports.allTeacherSalary = catchAsync(async (req, res, next) => {
  const teachers = await Teacher.find({ role: "teacher" });

  res.status(200).render("AllTeacherSalary", {
    title: "Salary Total",
    teachers,
  });
});

exports.previusMonthSalary = catchAsync(async (req, res, next) => {
  // var d = new Date();
  // var newMonth = d.getMonth() - 1;

  // if (newMonth < 0) {
  //   newMonth += 12;
  //   d.setYear(d.getFullYear() - 1); // use getFullYear instead of getYear !
  // }
  // const previusMonth = new Date(d.setMonth(newMonth));

  let previusMonth = getPreviousMonth();

  const teachers = await Teacher.find({ role: "teacher" }).populate("students");

  const previousMonthTeacherSalary = [];

  teachers.forEach((teacher) => {
    const previousMonthStudents = [];
    const teacherStudentsIds = teacher.students.map((teacherStudent) => {
      return teacherStudent._id.toString();
    });

    if (teacher.studentsAttendanceTotal.length > 0) {
      teacher.studentsAttendanceTotal.forEach((stAtTo) => {
        if (teacherStudentsIds.includes(stAtTo.id.toString())) {
          previousMonthStudents.push(stAtTo);
        }
      });
    }
    teacher.studentsAttendanceTotal.forEach((student) => {
      if (
        new Date(student.date).getMonth() == previusMonth.getMonth() &&
        new Date(student.date).getFullYear() == previusMonth.getFullYear()
      ) {
        previousMonthStudents.push(student);
      }
    });
    teacher.salary.salaryDate.forEach((date, i) => {
      if (
        new Date(date).getMonth() == previusMonth.getMonth() &&
        new Date(date).getFullYear() == previusMonth.getFullYear()
      ) {
        previousMonthTeacherSalary.push({
          name: teacher.name,
          lastName: teacher.lastName,
          totalPresent: teacher.salary.totalPresent[i],
          totalClasses: teacher.salary.totalClasses[i],
          totalSalary: teacher.salary.salaryAmount[i],
          date: teacher.salary.salaryDate[i],
        });
      }
    });
  });

  res.status(200).render("previousMonthSalary", {
    title: "Previous Month Salary",
    previousMonthTeacherSalary,
  });
});

exports.currentMonthCompleteAttendance = catchAsync(async (req, res, nest) => {
  const students = await Student.find();
  let currentMonthAttendedStudents = [];
  let teacher = "No teacher";

  const teachers = await Teacher.find({ role: "teacher" });

  students.forEach((student) => {
    if (student.teacher.length > 0) {
      teachers.forEach((teacher) => {
        if (teacher._id.toString() == student.teacher[0].toString()) {
          student.teacherName = teacher.name;
          student.teacherLastName = teacher.lastName;
        }
      });
    }
  });

  students.forEach((student) => {
    student["startClass"] = display12HoursTime(
      +student.timeFrom.split(":")[0],
      +student.timeFrom.split(":")[1]
    );
    student["endClass"] = display12HoursTime(
      +student.timeTo.split(":")[0],
      +student.timeTo.split(":")[1]
    );

    student.attendance.date.forEach((date, i) => {
      if (
        new Date(date).getMonth() == new Date().getMonth() &&
        new Date(date).getFullYear() == new Date().getFullYear()
      ) {
        if (student.teacher.length > 0) {
          currentMonthAttendedStudents.push({
            name: student.name,
            teacherName: student.teacherName,
            teacherLastName: student.teacherLastName,
            attended: student.attendance.attended[i],
            class: student.class,
            startClass: student.startClass,
            endClass: student.endClass,
            date,
          });
        }
        if (student.teacher.length == 0) {
          currentMonthAttendedStudents.push({
            name: student.name,
            teacherName: "No teacher",
            teacherLastName: "No teacher",
            attended: student.attendance.attended[i],
            class: student.class,
            startClass: student.startClass,
            endClass: student.endClass,
            date,
          });
        }
      }
    });
  });

  res.status(200).render("currentMonthCompleteAttendance", {
    title: "Complete Attendance Current Month",
    attendance: currentMonthAttendedStudents,
  });
});

exports.previousMonthCompleteAttendance = catchAsync(async (req, res, next) => {
  let page = "edit_student";
  if (req.url.startsWith("/student_info")) {
    page = "student_info";
  }

  let previusMonth = getPreviousMonth();

  const students = await Student.find();
  let previousMonthAttendedStudents = [];
  let teacher = "No teacher";

  const teachers = await Teacher.find({ role: "teacher" });

  students.forEach((student) => {
    if (student.teacher.length > 0) {
      teachers.forEach((teacher) => {
        if (teacher._id.toString() == student.teacher[0].toString()) {
          student.teacherName = teacher.name;
          student.teacherLastName = teacher.lastName;
        }
      });
    }
  });

  students.forEach((student) => {
    student["startClass"] = display12HoursTime(
      +student.timeFrom.split(":")[0],
      +student.timeFrom.split(":")[1]
    );
    student["endClass"] = display12HoursTime(
      +student.timeTo.split(":")[0],
      +student.timeTo.split(":")[1]
    );

    student.attendance.date.forEach((date, i) => {
      if (
        new Date(date).getMonth() == previusMonth.getMonth() &&
        new Date(date).getFullYear() == previusMonth.getFullYear()
      ) {
        if (student.teacher.length > 0) {
          previousMonthAttendedStudents.push({
            name: student.name,
            teacherName: student.teacherName,
            teacherLastName: student.teacherLastName,
            attended: student.attendance.attended[i],
            class: student.class,
            startClass: student.startClass,
            endClass: student.endClass,
            date,
          });
        }
        if (student.teacher.length == 0) {
          previousMonthAttendedStudents.push({
            name: student.name,
            teacherName: "No teacher",
            teacherLastName: "No teacher",
            attended: student.attendance.attended[i],
            class: student.class,
            startClass: student.startClass,
            endClass: student.endClass,
            date,
          });
        }
      }
    });
  });

  res.status(200).render("previousMonthCompleteAttendance", {
    title: "Previous Month Attendance",
    attendance: previousMonthAttendedStudents,
  });
});

exports.adminAttendStudents = catchAsync(async (req, res, next) => {
  const students = await Student.find();
  const teachers = await Teacher.find({ role: "teacher" });

  let hasTeacherStudents = [];
  hasTeacherStudents = students.filter((student) => {
    if (student.teacher.length > 0) {
      return student;
    }
  });

  teachers.forEach((teacher) => {
    hasTeacherStudents.forEach((student) => {
      if (student.teacher.length > 0) {
        if (student.teacher[0].toString() == teacher._id.toString()) {
          (student.teacherName = teacher.name),
            (student.teacherLastName = teacher.lastName);
        }
      }
    });
  });

  ////////////////

  let searchedStudents = [];
  let adminInputSearch = "";
  if (req.query.adminInputSearch) inputSearch = req.query.adminInputSearch;

  if (
    req.query.adminInputSearch != undefined ||
    req.query.adminInputSearch != ""
  ) {
    searchedStudents = hasTeacherStudents.filter((student) => {
      if (
        req.query.adminInputSearch != undefined &&
        student.name
          .toLowerCase()
          .includes(req.query.adminInputSearch.toLowerCase())
      ) {
        return student;
      }
    });
  }
  let result;

  if (req.query.adminInputSearch != undefined && searchedStudents.length == 0) {
    result = "No match!";
  }

  const attendedStudents = [];
  if (searchedStudents.length > 0) hasTeacherStudents = searchedStudents;
  hasTeacherStudents.forEach((student) => {
    student["startClass"] = display12HoursTime(
      +student.timeFrom.split(":")[0],
      +student.timeFrom.split(":")[1]
    );
    student["endClass"] = display12HoursTime(
      +student.timeTo.split(":")[0],
      +student.timeTo.split(":")[1]
    );
    student.attendance.date.forEach((attend, i) => {
      if (
        new Date(attend).getDate() == new Date().getDate() &&
        new Date(attend).getMonth() == new Date().getMonth() &&
        new Date(attend).getFullYear() == new Date().getFullYear()
      ) {
        attendedStudents.push({
          date: attend,
          attended: student.attendance.attended[i],
          id: student._id,
          name: student.name,
          timeFrom: student.timeFrom,
          timeTo: student.timeTo,
          teacherName: student.teacherName,
          vacation: student.vacation,
          gender: student.gender,
          class: student.class,
          attendance: student.attendance,
          startClass: student.startClass,
          endClass: student.endClass,
        });
      }
    });

    if (
      new Date(
        student.attendance.date[student.attendance.date.length - 1]
      ).getDate() != new Date().getDate() ||
      new Date(
        student.attendance.date[student.attendance.date.length - 1]
      ).getMonth() != new Date().getMonth()
    ) {
      attendedStudents.push({
        id: student._id,
        name: student.name,
        timeFrom: student.timeFrom,
        timeTo: student.timeTo,
        teacherName: student.teacherName,
        vacation: student.vacation,
        gender: student.gender,
        class: student.class,
        attendance: student.attendance,
        startClass: student.startClass,
        endClass: student.endClass,
      });
    }
  });
  const newStudents = attendedStudents;
  
  if (req.query.adminInputSearch == "") {
    res.redirect(`/admin_attend_students`);
    return;
  }
  
  res.status(200).render("adminTakeAttendance", {
    title: "Take Attendance",
    result,
    newStudents,
    adminInputSearch,
  });
});

const removeUnnessaryPhoto = catchAsync(async () => {
  const teachers = await Teacher.find();
  const photos = teachers.map((teacher) => {
    return teacher.photo;
  });
  fs.readdir("./controllers/../Public/images/users", (err, files) => {
    files.forEach((file) => {
      if (file.startsWith("user") && !photos.includes(file)) {
        fs.unlinkSync(`./controllers/../Public/images/users/${file}`);
      }
    });
  });
});

cron.schedule("40 * * * * *", () => {
  caculateTeacherSalaryAutomatically();
  setTimeout(() => {
    removeUnnessaryPhoto();
  }, 7000);
  setTimeout(() => {
    secondPartOfAutomateSalaryCalculate();
  }, 15000);
});
