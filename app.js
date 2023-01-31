const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cron = require("node-cron");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const AttendanceRoutes = require("./routes/attendanceRoutes");
const TeacherRoutes = require("./routes/teacherRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const attendanceController = require("./controllers/attendanceController");
const Attendance = require("./models/attendanceModel");
const Teacher = require("./models/teacherModel");
const viewRouter = require("./routes/viewRoutes");

function changeTimeZone(date, timeZone) {
  if (typeof date === 'string') {
    return new Date(
      new Date(date).toLocaleString('en-US', {
        timeZone,
      }),
    );
  }

  return new Date(
    date.toLocaleString('en-US', {
      timeZone,
    }),
  );
}

let laDate = changeTimeZone(new Date(), 'Asia/kabul');

// start express app
const app = express();

// Server side rendering functionality
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 1) Global Middlewares
// implement cors
app.use(cors());

app.options("*", cors());

// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy-Report-Only', "default-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js ; script-src  'self' ; style-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js; "
//   );
  
//   next();
// });


//Serving static files
app.use(express.static(`${__dirname}/Public`));

// Set security http headers
// app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit too many requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, please try again after an hour",
});
app.use("/api", limiter);

//// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Prevent parameter pullotion
app.use(hpp());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Serving static files
// app.use(express.static(path.join(__dirname, "public")));

// automatically absent or off day
const Days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const tomoDate = laDate;
const vacations = Days[laDate.getDay()];
const dateFilter = tomoDate.setDate(tomoDate.getDate() - 1);

const tomorrow = tomoDate.setDate(tomoDate.getDate() - 1);

const currentDate = laDate;

const getAttendance = async () => {
  const attendance = await Attendance.find();
  const my = attendance.map((el) => {
    if (el.vacation.includes(vacations)) {
      if (el.attendance.date.length < 1) {
        el.attendance.date.push(laDate);
        el.attendance.attended.push("off day");
        el.save();
      } else if (
        new Date(
          el.attendance.date[el.attendance.date.length - 1]
        ).getFullYear() !== currentDate.getFullYear() ||
        new Date(
          el.attendance.date[el.attendance.date.length - 1]
        ).getDate() !== currentDate.getDate() ||
        new Date(
          el.attendance.date[el.attendance.date.length - 1]
        ).getMonth() !== currentDate.getMonth()
      ) {
        el.attendance.date.push(laDate);
        el.attendance.attended.push("off day");
        el.save({ validateBeforeSave: false });
      }
    }

    if (
      new Date(el.attendance.date[el.attendance.date.length - 1]).getDate() !==
      laDate.getDate() &&
      laDate.getHours() == 23 &&
      laDate.getMinutes() > 50
    ) {
      el.attendance.attended.push("teacher absent");
      el.attendance.date.push(laDate);
      el.save({ validateBeforeSave: false });
    }
    if (
      el.attendance.date.length < 1 &&
      laDate.getHours() == 23 &&
      laDate.getMinutes() > 50
    ) {
      el.attendance.date.push(laDate);
      el.attendance.attended.push("teacher absent");
      el.save({ validateBeforeSave: false });
    }
  });
};

cron.schedule("30 * * * * *", () => {
  getAttendance();
});

// Routes
app.use("/", viewRouter);
app.use("/api/v1/attendance", AttendanceRoutes);
app.use("/api/v1/users", TeacherRoutes);

// get the routes that are not defined
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this sever`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
