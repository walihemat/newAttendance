const Attendance = require("../models/attendanceModel");
const catchAsync = require("./../utils/catchAsync");
const cron = require("node-cron");
const Teacher = require("./../models/teacherModel");

const Attandance = require(`${__dirname}/../models/attendanceModel`);
const catchAysnc = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");


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



exports.getAllAttendance = catchAysnc(async (req, res, next) => {
  const attendances = await Attandance.find();
  res.status(200).json({
    attendances,
  });
});

exports.getAttendance = catchAsync(async (req, res, next) => {
  const attendance = await Attandance.findById(req.params.id).populate({
    path: "teacher",
    select: "name",
  });

  if (!attendance) {
    return next(new AppError("No student found with that ID", 404));
  }

  res.status(200).json({
    attendance,
  });
});
exports.createAttendance = catchAysnc(async (req, res) => {
  const attendance = await Attandance.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      attendance,
    },
  });
});

exports.updateAttendance = catchAsync(async (req, res) => {
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      class: req.body.class,
      gender: req.body.gender,
      vacation: req.body.vacation,
      timeFrom: req.body.timeFrom,
      timeTo: req.body.timeTo,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      attendance,
    },
  });
});

exports.deleteAttendance = catchAsync(async (req, res, next) => {
  const attendance = await Attandance.findByIdAndDelete(req.params.id);

  if (!attendance) {
    return next(new AppError("No teacher found with that ID", 404));
  }

  res.status(400).json({
    status: "success",
    attendance,
  });
});

exports.attendStudents = catchAsync(async (req, res, next) => {
  const student = await Attendance.findById(req.params.id);

  

  

  const tomoDate = new Date();

  const dateFilter = tomoDate.setDate(tomoDate.getDate() - 1);

  if (
    student.attendance.date.length > 0 &&
    new Date(
      student.attendance.date[student.attendance.date.length - 1]
    ).getDate() == new Date().getDate() &&
    student.attendance.date.length > 0 &&
    new Date(
      student.attendance.date[student.attendance.date.length - 1]
    ).getMonth() == new Date().getMonth() &&
    new Date(
      student.attendance.date[student.attendance.date.length - 1]
    ).getFullYear() == new Date().getFullYear()
  ) {
    return next(new AppError("The student has already presented", 401));
  }

  let [...attend] = student.attendance.attended;
  let [...date] = student.attendance.date;

  if (
    student.attendance.attended.length > 0 &&
    student.attendance.date.length > 0
  ) {
    attend.push(req.body.attended);
    student.attendance.attended = attend;

    date.push(new Date());
    student.attendance.date = date;
  } else {
  }
  if (student.attendance.attended.length < 1) {
    student.attendance.attended = req.body.attended;
  }
  if (student.attendance.date.length < 1) {
    student.attendance.date = new Date();
  }

  student.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

exports.showTodayPresentUbsentStudents = catchAsync(async (req, res, next) => {
  const students = await Attendance.find();
  const todayStudents = [];

  students.forEach((student) => {
    const studentDate = student.attendance.date;

    studentDate.filter((d, i) => {
      if (
        new Date(d).getDate() == new Date().getDate() &&
        new Date(d).getMonth() == new Date().getMonth() &&
        new Date(d).getFullYear() == new Date().getFullYear()
      ) {
        if (
          student.attendance.attended[i] == "present" ||
          student.attendance.attended[i] == "teacher absent" ||
          student.attendance.attended[i] == "off day" ||
          student.attendance.attended[i] == "student absent"
        ) {
          todayStudents.push({
            id: student._id,
            name: student.name,
            status: student.attendance.attended[i],
          });
        }
      }
    });
  });

  res.status(200).json({
    status: "success",
    data: {
      todayStudents,
    },
  });
});

exports.removeTeacherStudent = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  const index = attendance.teacher.indexOf(req.body.teacherId);
  attendance.teacher.splice(index, 1);
  attendance.attendance = [];
  attendance.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
  });
});

const AutoDeleteOutDatedAttendanceRecods = catchAsync(async () => {
  let previusMonth = getPreviousMonth();
  

  const students = await Attendance.find();
  students.forEach((student) => {
    if (student.attendance.date.length > 0) {
      student.attendance.date.forEach((date, i) => {
        if (
          new Date(date).getMonth() !== new Date().getMonth() &&
          new Date(date).getMonth() !== previusMonth.getMonth()
        ) {
          student.attendance.date.splice(i, 1);
          student.attendance.attended.splice(i, 1);
          student.save({ validateBeforeSave: false });
        }
      });
    }
  });
});

cron.schedule("15 * * * * *", () => {
  AutoDeleteOutDatedAttendanceRecods();
});
