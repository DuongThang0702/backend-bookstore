import dotenv from "dotenv";
dotenv.config();
import jwt, { TokenExpiredError } from "jsonwebtoken";
import handleErrors from "./handle_error";

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const accessToken = token?.split(" ")[1];
    if (!accessToken)
      return handleErrors.BadRequest("Require authorization", res);
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, (error, user) => {
      if (error) {
        const isChecked = error instanceof TokenExpiredError;
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

export default verifyToken;
