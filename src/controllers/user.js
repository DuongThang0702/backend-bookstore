import dotenv from "dotenv";
dotenv.config();
import joi from "joi";
import bcrypt from "bcrypt";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/";
import { password, email, token } from "../helpers/joi_schema";
import handleErrors from "../middleware/handle-errors";
import sendMail from "../helpers/send_email";

const UserController = {
  getUserCurrent: async (req, res) => {
    try {
      const userId = req.user?._id;
      const response = await User.findById(userId).select(
        "-refreshToken -password -role"
      );
      if (!response) return handleErrors.BadRequest("not found", res);
      res.status(200).json({
        err: 0,
        mess: "Got",
        userData: response,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },
  login: async (req, res) => {
    const { error } = joi.object({ email, password }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const response = await User.findOne({ email: req.body.email });
      const isChecked =
        response &&
        (await bcrypt.compare(req.body.password, response.password));
      const accessToken =
        isChecked && UserController.generateAccessToken(response);
      const refresh_token =
        isChecked && UserController.generateRefreshToken(response);

      await User.findByIdAndUpdate(response?._id, {
        refreshToken: refresh_token,
      });
      const { password, ...userdata } = response?.toObject();

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        err: accessToken ? 0 : 1,
        mess: accessToken
          ? "login successfully"
          : response
          ? "Wrong password"
          : "Email invalid",
        user_data: accessToken ? userdata : null,
        access_token: accessToken ? `Bearer ${accessToken}` : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  register: async (req, res) => {
    const { error } = joi.object({ password, email }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const isCheckedUser = await User.findOne({ email: req.body.email });
      if (isCheckedUser)
        return handleErrors.BadRequest("Email has existed", res);
      const newUser = new User({
        email: req.body.email,
        password: hash,
      });
      const response = await newUser.save();
      res.status(200).json(response);
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  logout: async (req, res) => {
    try {
      const cookie = req.cookies;
      if (!cookie && !cookie.refresh_token)
        return handleErrors.BadRequest("No refresh token in cookies", res);
      const response = await User.findOneAndUpdate(
        {
          refreshToken: cookie.refresh_token,
        },
        { refreshToken: "" },
        { new: true }
      );
      response &&
        res.clearCookie("refresh_token", { httpOnly: true, secure: true });
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? "logout successfully" : "Refresh token not matched",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  generateAccessToken: (response) => {
    return jwt.sign(
      { _id: response._id, email: response.email, role: response.role },
      `${process.env.ACCESS_TOKEN}`,
      { expiresIn: "30s" }
    );
  },

  generateRefreshToken: (response) => {
    return jwt.sign({ _id: response._id }, `${process.env.REFRESH_TOKEN}`, {
      expiresIn: "5d",
    });
  },

  refreshTokenController: async (req, res) => {
    try {
      const cookie = req.cookies;
      if (!cookie && !cookie.refresh_token)
        return handleErrors.BadRequest("No refresh token in cookies", res);
      jwt.verify(
        cookie.refresh_token,
        process.env.REFRESH_TOKEN,
        async (err, user) => {
          if (err) {
            const isChecked = err instanceof TokenExpiredError;
            if (isChecked)
              return handleErrors.UnAuth("Token expired", res, isChecked);
            if (!isChecked)
              return handleErrors.UnAuth("Token invalid", res, isChecked);
          }
          const response = await User.findOne({
            _id: user._id,
            refreshToken: cookie.refresh_token,
          });
          res.status(200).json({
            err: response ? 0 : 1,
            newAccessToken: response
              ? UserController.generateAccessToken(response)
              : null,
          });
        }
      );
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.query?.email;
      if (!email) return handleErrors.BadRequest("Missing Email", res);
      const user = await User.findOne({ email: email });
      if (!user) return handleErrors.BadRequest("User not found", res);
      const resetToken = user.createPasswordChangedToken();
      await user?.save();
      const html = `<p>We heard that you lost your BookStore password. Sorry about that!</p> </br> 
        <p>But don’t worry! You can use the following button to reset your password:</p> </br> 
        <a href=${`${process.env.URL_SERVER}/api/v1/user/reset-password/${resetToken}`}>Reset your password </a>`;
      const data = {
        email,
        html,
      };
      const response = await sendMail(data);
      res.status(200).json({
        err: response ? 0 : 1,
        response,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  resetPassword: async (req, res) => {
    const { error } = joi.object({ password, token }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const { password, token } = req.body;
      const passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await User.findOne({
        passwordResetToken,
        passwordResetExpired: { $gt: Date.now() },
      });
      if (!user) return handleErrors.BadRequest("Invalid reset token", res);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user.password = hash;
      user.passwordChangedAt = Date.now().toString();
      user.passwordResetToken = "";
      user.passwordResetExpired = "";
      await user.save();
      res.status(200).json({
        err: user ? 0 : 1,
        mess: user ? "Updated password" : "Something went wrong",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  getUsers: async (req, res) => {
    try {
      const response = await User.find();
      res.status(200).json({
        err: response ? 0 : 1,
        Users: response ? response : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.query;
      const response = await User.findByIdAndDelete({ _id: id });
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response
          ? `User with email ${response.email} deleted`
          : "No user delete",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId || Object.keys(req.body).length === 0)
        return handleErrors.BadRequest("Missing input", res);
      const response = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
      }).select("-password -role");

      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? response : "No user update",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateUserByAdmin: async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId || Object.keys(req.body).length === 0)
        return handleErrors.BadRequest("Missing input", res);
      const response = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
      }).select("-password -role");

      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? response : "No user update",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },
};

export default UserController;
