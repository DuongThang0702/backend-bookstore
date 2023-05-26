require("dotenv").config();
const jwt = require("jsonwebtoken");
const handleErrors = require("./handle-errors");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;
    if (!token) return handleErrors.BadRequest("Require authorization", res);
    const accessToken = token?.split(" ")[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, (error, user) => {
      if (error) {
        const isChecked = error instanceof jwt.TokenExpiredError;
        if (isChecked)
          return handleErrors.UnAuth("Token expired", res, isChecked);
        if (!isChecked)
          return handleErrors.UnAuth("invalid Token", res, isChecked);
      }
      req.user = user;
      next();
    });
  } catch (err) {
    return handleErrors.InternalServerError(res);
  }
};

module.exports = verifyToken;
