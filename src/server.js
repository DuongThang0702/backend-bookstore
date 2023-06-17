const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/database");
const initRoutes = require("./router/");

const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: process.env.URL_CLIENT,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
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
initRoutes(app);
