require("dotenv").config();
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const makeToken = require("uniqid");

const { User } = require("../models/");
const {
  password,
  email,
  token,
  district,
  ward,
  city,
  homeNumber,
  bid,
  quantity,
  firstName,
  lastName,
} = require("../helpers/joi-schema");
const handleErrors = require("../middleware/handle-errors");
const sendMail = require("../helpers/send-email");

const UserController = {
  getUserCurrent: async (req, res) => {
    try {
      const userId = req.user?._id;
      const response = await User.findById(userId).select(
        "-refreshToken -password -role"
      );
      if (!response) return handleErrors.BadRequest("not found", res);
      res.status(200).json({
        error: 0,
        mes: "Got",
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
      const user = await User.findOne({ email: req.body.email });
      if (!user) return handleErrors.BadRequest("Email invalid", res);
      const isChecked =
        user && (await bcrypt.compare(req.body.password, user.password));
      const accessToken = isChecked && UserController.generateAccessToken(user);
      const refresh_token =
        isChecked && UserController.generateRefreshToken(user);
      const response = await User.findByIdAndUpdate(
        user?._id,
        { refresh_token },
        { new: true }
      );
      const { password, ...userData } = response.toObject();
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        error: accessToken ? 0 : 1,
        mes: accessToken
          ? "login successfully"
          : response
          ? "Wrong password"
          : "Something went wrong !",
        user_data: accessToken ? userData : null,
        access_token: accessToken ? `Bearer ${accessToken}` : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  // register: async (req, res) => {
  //   const { error } = joi
  //     .object({ password, email, firstName, lastName })
  //     .validate(req.body);
  //   if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
  //   try {
  //     const salt = await bcrypt.genSalt(10);
  //     const hash = await bcrypt.hash(req.body.password, salt);
  //     const isCheckedUser = await User.findOne({ email: req.body.email });
  //     if (isCheckedUser)
  //       return handleErrors.BadRequest("Email has existed", res);
  //     const newUser = new User({
  //       firstName: req.body.firstname,
  //       lastName: req.body.lastname,
  //       email: req.body.email,
  //       password: hash,
  //     });
  //     const response = await newUser.save();
  //     res.status(200).json({
  //       error: response ? 0 : 1,
  //       mes: response
  //         ? "Register is successfully. Please go to login"
  //         : "failed",
  //     });
  //   } catch (err) {
  //     return handleErrors.InternalServerError(res);
  //   }
  // },

  register: async (req, res) => {
    const { error } = joi
      .object({ email, password, lastName, firstName })
      .validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    const isCheckUser = await User.findOne({ email: req.body.email });
    if (isCheckUser) return handleErrors.BadRequest("Email has existed", res);
    try {
      const token = makeToken();
      res.cookie(
        "dataRegister",
        { ...req.body, token },
        {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        }
      );
      const html = `<p>
      Please click the button below to complete the registration process</p> </br>
      <a href=${`${process.env.URL_SERVER}/api/v1/user/final-register/${token}`}>Click me</a>`;

      await sendMail({
        email: req.body.email,
        html,
        subject: "complete registration",
      });
      res
        .status(200)
        .json({ error: 0, mes: "Please check your email to active account" });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  finalRegister: async (req, res) => {
    const cookie = req.cookies;
    const { token } = req.params;
    if (!cookie || cookie?.dataRegister?.token !== token) {
      res.clearCookie("dataRegister");
      return res.redirect(`${process.env.URL_CLIENT}/final-register/failed`);
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(cookie?.dataRegister?.password, salt);
      const newUser = await User.create({
        email: cookie?.dataRegister?.email,
        password: hash,
        lastName: cookie?.dataRegister?.lastName,
        firstName: cookie?.dataRegister?.firstName,
      });
      res.clearCookie("dataRegister");
      if (newUser)
        return res.redirect(`${process.env.URL_CLIENT}/final-register/success`);
      else
        return res.redirect(`${process.env.URL_CLIENT}/final-register/failed`);
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
        { refreshToken: "" }
      );
      response &&
        res.clearCookie("refresh_token", { httpOnly: true, secure: true });
      res.status(200).json({
        error: response ? 0 : 1,
        mes: response ? "logout successfully" : "Refresh token not matched",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  generateAccessToken: (response) => {
    return jwt.sign(
      { _id: response._id, email: response.email, role: response.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
  },

  generateRefreshToken: (response) => {
    return jwt.sign({ _id: response._id }, process.env.REFRESH_TOKEN, {
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
            const isChecked = err instanceof jwt.TokenExpiredError;
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
            error: response ? 0 : 1,
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
    const { error } = joi.object({ email }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return handleErrors.BadRequest("User not found", res);
      const resetToken = user.createPasswordChangedToken();
      await user?.save();
      const html = `<p>We heard that you lost your BookStore password. Sorry about that!</p> </br> 
        <p>But don’t worry! You can use the following button to reset your password:</p> </br> 
        <a href=${`${process.env.URL_CLIENT}/reset-password/${resetToken}`}>Reset your password </a>`;
      await sendMail({
        email,
        html,
        subject: "Forgot password",
      });
      res
        .status(200)
        .json({ error: 0, mes: "Please check your email to active account" });
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
        error: user ? 0 : 1,
        mes: user ? "Updated password" : "Something went wrong",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  getUsers: async (req, res) => {
    try {
      const response = await User.find();
      res.status(200).json({
        error: response ? 0 : 1,
        Users: response ? response : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { uid } = req.params;
      const response = await User.findByIdAndDelete(uid);
      res.status(200).json({
        error: response ? 0 : 1,
        mes: response
          ? `User with email ${response.email} deleted`
          : "No user delete",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateUser: async (req, res) => {
    const { _id } = req.user;
    if (!_id || Object.keys(req.body).length === 0)
      return handleErrors.BadRequest("Missing input", res);
    try {
      const response = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
      }).select("-password -role");
      res.status(200).json({
        error: response ? 0 : 1,
        mes: response ? response : "No user update",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateUserByAdmin: async (req, res) => {
    try {
      const { uid } = req.params;
      if (!uid || Object.keys(req.body).length === 0)
        return handleErrors.BadRequest("Missing input", res);
      const response = await User.findByIdAndUpdate(uid, req.body, {
        new: true,
      }).select("-password -role");

      res.status(200).json({
        error: response ? 0 : 1,
        mes: response ? response : "No user update",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateAddress: async (req, res) => {
    const { error } = joi
      .object({ district, ward, city, homeNumber })
      .validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const { _id } = req.user;
      const response = await User.findByIdAndUpdate(
        _id,
        {
          $push: { address: req.body },
        },
        { new: true }
      ).select("-password -role -rerfeshToken");
      res.status(200).json({
        error: response ? 0 : 1,
        mes: response ? "Updated" : "Something went worng !",
        updateAddress: response ? response : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateCart: async (req, res) => {
    const { error } = joi.object({ bid, quantity }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const { _id } = req.user;
      const user = await User.findById(_id).select("cart");
      const alreadyBook = user?.cart?.find(
        (el) => el.bid.toString() === req.body.bid
      );
      if (alreadyBook) {
        if (alreadyBook.quantity !== +req.body.quantity) {
          const response = await User.updateOne(
            {
              cart: { $elemMatch: alreadyBook },
            },
            { $set: { "cart.$.quantity": req.body.quantity } },
            { new: true }
          );
          res.status(200).json({
            err: response ? 0 : 1,
            Cart: response ? response : "Something went wrong !",
          });
        } else {
          const response = await User.findByIdAndUpdate(
            _id,
            { $push: { cart: req.body } },
            { new: true }
          );
          res.status(200).json({
            err: response ? 0 : 1,
            Cart: response ? response : "Something went wrong !",
          });
        }
      } else {
        const response = await User.findByIdAndUpdate(
          _id,
          { $push: { cart: req.body } },
          { new: true }
        );
        res.status(200).json({
          error: response ? 0 : 1,
          Cart: response ? response : "Something went wrong !",
        });
      }
    } catch (err) {
      // throw new Error(err);
      return handleErrors.InternalServerError(res);
    }
  },
};

module.exports = UserController;
