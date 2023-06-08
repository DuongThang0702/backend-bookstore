const joi = require("joi");

//auth User
const password = joi.string().min(6).required();
const email = joi.string().pattern(new RegExp("gmail.com")).required();
const refreshToken = joi.string().required();
const mobile = joi.number().min(10).max(10).required();
const token = joi.string().required();

//address User
const district = joi.string().required();
const ward = joi.string().required();
const city = joi.string().required();
const homeNumber = joi.string().required();

//cart User
const quantity = joi.number().required();

//Book
const title = joi.string().required();
const price = joi.number().required();
const image = joi.string();
const description = joi.string();
const category = joi.array();
const available = joi.number().required();
const sold = joi.number();
const totalRatings = joi.number();
const bid = joi.string().required();

// ratings book
const star = joi.number().required();
const comment = joi.string();
const bookId = joi.string().required();

//coupon book
const titleCoupon = joi.string().required();
const discount = joi.number().required();
const expiry = joi.number().required();

module.exports = {
  password,
  email,
  refreshToken,
  mobile,
  token,
  title,
  price,
  image,
  description,
  category,
  available,
  sold,
  totalRatings,
  bid,
  star,
  comment,
  bookId,
  titleCoupon,
  discount,
  expiry,
  district,
  ward,
  city,
  homeNumber,
  quantity,
};
