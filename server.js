require("dotenv").config({ path: "./config.env" });
const app = require("./src/app");
const mongoose = require("mongoose");
const connectDB = require("./src/database/mongoConn");

connectDB();

const port = process.env.PORT || 3000;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () =>
    console.log(
      `Server running con port ${port} on ${process.env.NODE_ENV} mode.`
    )
  );
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
});
