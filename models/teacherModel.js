const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide teacher's name"],
    },
    lastName: {
      type: String,
      default: "Afghan",
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: "default.png",
    },
    class: {
      type: String,
      default: "Islamic",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    gender: {
      type: String,
      default: "Male",
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on Create() and SAVE();
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
    salary: {
      salaryDate: Array,
      salaryAmount: Array,
      totalPresent: Array,
      totalClasses: Array,
    },
    studentsAttendanceTotal: Array,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teacherSchema.virtual("students", {
  ref: "attendance",
  foreignField: "teacher",
  localField: "_id",
});

teacherSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// middleware for password encription
teacherSchema.pre("save", async function (next) {
  // only run this function if password is modified
  if (!this.isModified("password")) return next();
  // encrypt or hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// an instance method and this is available on all teacherSchema everywhere
// decrypt the password provided by the user and compare it with the decrypted password stored in the database
teacherSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if the user has changed the password
teacherSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // Means password changed
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Generate random token
teacherSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
