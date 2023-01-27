const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXPCEPTION! Shutting down...");
 console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABSE_PASSWORD
// );

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then((con) => console.log("DB connection successfull!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, (req, res) => {
  console.log(`App running on prot ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!  Shutting Down......");
  server.close(() => {
    process.exit(1);
  });
});
