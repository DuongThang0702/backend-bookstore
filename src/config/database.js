const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.URI_MONGOOSE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected mongodb"))
    .catch(() => console.log("Unable DB"));
};

module.exports = connectDB;
