import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.URI_MONGOOSE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected mongodb"))
    .catch(() => console.log("Unable DB"));
};

export default connectDB;
