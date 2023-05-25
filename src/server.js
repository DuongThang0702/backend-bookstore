import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/connect-db.js";
// import initRoutes from "./routes";

const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    // origin: process.env.REACT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});

connectDB();
// initRoutes(app);
