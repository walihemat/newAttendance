const express = require("express");
const viewsController = require("./../controllers/viewsControler");
const authController = require("./../controllers/authTeacherController");

const router = express.Router();

router.get("/login", authController.isLoggedIn, viewsController.login);
router.get("/", authController.isLoggedIn, viewsController.getOverview);

// router.use();
router.get(
  "/edit_teacher/:id",
  authController.protect,
  viewsController.getTeacher
);

router.get(
  "/teachers",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getAllTeachers
);

router.get(
  "/admin_dashboard",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getTodayAttendedStudents
);

router.get(
  "/teacher_dashboard/:id",
  authController.protect,
  authController.restrictTo("teacher"),
  viewsController.teacherAttendStudents
);

router.get(
  "/teacher_info/:id",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getTeacher
);

router.get(
  "/student_info/:id",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getStudent
);

router.get(
  "/add_student",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.addStudent
);

router.get(
  "/add_teacher",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.addTeacher
);

router.get(
  "/students",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getStudents
);

router.get(
  "/edit_student/:id",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.getStudent
);

router.get(
  "/changePassword",
  authController.protect,
  viewsController.changePassword
);

router.get(
  "/teacherSalary/:id",
  authController.protect,
  viewsController.getTeacherSalary
);

router.get(
  "/allTeacherSalary",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.allTeacherSalary
);

router.get(
  "/previousMonthSalary",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.previusMonthSalary
);

router.get(
  "/teacherPreviousMonthSalary/:id",
  authController.protect,
  viewsController.getTeacherSalaryPreviousMonth
);

router.get(
  "/completeAttendance",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.currentMonthCompleteAttendance
);

router.get(
  "/previousMonthCompleteAttendance",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.previousMonthCompleteAttendance
);

router.get(
  "/admin_attend_students",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.adminAttendStudents
);

module.exports = router;
