const express = require("express");
const authTeacherController = require("./../controllers/authTeacherController");
const teacherController = require("./../controllers/teacherController");

const router = express.Router();

router.post("/signup", authTeacherController.signup);

router.post("/login", authTeacherController.login);
router.get("/logout", authTeacherController.logout);

router.post("/forgotPassword", authTeacherController.forgotPassword);

router.patch("/resetPassword/:token", authTeacherController.resetPassword);

router.patch("/addStudents/:email", authTeacherController.addStudents);

router.patch(
  "/changeMyProfilePicture",
  authTeacherController.protect,
  teacherController.uploadUserPhoto,
  teacherController.resizeUserPhoto,
  teacherController.changeMyProfilePicture
);

router.patch(
  "/updateMe/:id",
  authTeacherController.protect,
  teacherController.updateMe
);

router.delete(
  "/deleteTeacher/:id",
  authTeacherController.protect,
  authTeacherController.restrictTo("admin"),
  teacherController.deleteTeacher
);

router.post(
  "/updatePassword",
  authTeacherController.protect,
  authTeacherController.updatePassword
);

router
  .route("/")
  .get(authTeacherController.protect, teacherController.getAllTeachers);

router
  .route("/:id")
  .get(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin"),
    teacherController.getTeacher
  )
  .patch(
    authTeacherController.protect,
    authTeacherController.restrictTo("admin"),
    teacherController.updatedTeacher
  );

module.exports = router;
