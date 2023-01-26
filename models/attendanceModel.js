const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A student must have a name"],
    },
    slug: String,
    teacher: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Teacher",
        required: [true, "A student should have a teacher"],
      },
    ],
    attendance: {
      date: Array,
      attended: Array,
    },
    vacation: {
      type: Array,
      required: [true, "A student should have off days"],
    },
    timeFrom: {
      type: String,
      required: [true, "A student should have a start time of class"],
    },
    timeTo: {
      type: String,
      required: [true, "A student should have an end time of class"],
    },
    class: {
      type: String,
      required: [true, "A student should have a class"],
    },
    gender: {
      type: String,
      required: [true, "A student should have gender"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Attendance = mongoose.model("attendance", attendanceSchema);

module.exports = Attendance;
