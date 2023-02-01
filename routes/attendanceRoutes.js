const express = require("express");
const attendanceController = require(`${__dirname}/../controllers/attendanceController`);
const authTeacherController = require("./../controllers/authTeacherController");

const router = express.Router();

router
  .route("/")
  .get(
    authTeacherController.restrictTo("admin"),
    authTeacherController.protect,
    attendanceController.getAllAttendance
  )
  .post(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin"),
    attendanceController.createAttendance
  );

router.post(
  "/attendStudents/:id",
  authTeacherController.protect,
  authTeacherController.restrictTo("admin", "teacher"),
  attendanceController.attendStudents
);

router.post(
  "/removeTeacherStudent/:id",
  authTeacherController.protect,
  authTeacherController.restrictTo("admin"),
  attendanceController.removeTeacherStudent
);

router.post(
  "/showAllPresentAbsentStudents",
  authTeacherController.protect,
  authTeacherController.restrictTo("admin"),
  attendanceController.showTodayPresentUbsentStudents
);

router
  .route("/:id")
  .get(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin", "teacher"),
    attendanceController.getAttendance
  )
  .patch(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin"),
    attendanceController.updateAttendance
  )
  .delete(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin"),
    attendanceController.deleteAttendance
  );

router.post(
  "/:id",
  authTeacherController.protect,
  authTeacherController.restrictTo("admin"),
  attendanceController.attendStudents
);

module.exports = router;
