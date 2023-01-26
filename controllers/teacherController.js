const Teacher = require("./../models/teacherModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Attendance = require("./../models/attendanceModel");
const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Public/images/users");
//   },
//   filename: (req, file, cb) => {
//     // user-439384djfdc0034-3943943949293.jpeg
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.teacher._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.teacher._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`Public/images/users/${req.file.filename}`);

  next();
});

exports.getAllTeachers = catchAsync(async (req, res, next) => {
  const teachers = await Teacher.find({ role: "teacher" });

  res.status(200).json({
    status: "success",
    data: {
      teachers,
    },
  });
});

exports.getTeacher = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id).populate({
    path: "students",
    select: "name -teacher",
  });

  await Attendance.findById(teacher.students[0]);

  res.status(200).json({
    status: "success",
    data: {
      teacher,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if the user provide password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You cannot update your password here. Please update in /updateMyPassword",
        400
      )
    );
  }
  // Get teacher
  const teacher = await Teacher.findById(req.params.id);

  // Get students
  const students = await Attendance.find();
  if (req.body.selected) {
    // Filter if teacher already has not the student
    students.forEach((s) => {
      req.body.selected.forEach((teacherStudent) => {
        if (teacherStudent == s._id) {
          if (
            s.teacher.length > 0 &&
            s.teacher[0].toString() === teacher._id.toString()
          ) {
            return next(
              new AppError(
                `(${s.name}) alread exists in ${
                  (teacher.name, teacher.lastName)
                }'s account!`
              )
            );
          }
          if (s.teacher.length > 0) {
            return next(new AppError(`(${s.name}) alread has a Teacher!`));
          } else {
            const studentTeacher = [];
            studentTeacher.push(req.params.id);
            s.teacher = studentTeacher[0];
            s.save({ validatorsBeforeSave: false });
          }
        }
      });
    });
  }

  // 2) Filter out the fields that the user is allowed to update

  const objBody = {
    name: req.body.teacherName,
    lastName: req.body.teacherLastName,
    class: req.body.teacherClass,
    email: req.body.email,
    gender: req.body.teacherGender,
  };
  // 3) Update the document
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    objBody,
    {
      new: true,
      runValidator: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      teacher,
    },
  });
});

exports.updatedTeacher = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: {
      teacher,
    },
  });
});

exports.deleteTeacher = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
  });
});

exports.changeMyProfilePicture = catchAsync(async (req, res, next) => {
  let teacher;
  if (req.file) {
    teacher = await Teacher.findByIdAndUpdate(req.teacher, {
      photo: req.file.filename,
    });
  } else {
    return next(new AppError("Please Provide an image!"));
  }
  res.status(200).json({
    status: "success",
  });
});
