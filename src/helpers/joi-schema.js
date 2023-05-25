import joi from "joi";

//User
export const password = joi.string().min(6).required();
export const email = joi.string().pattern(new RegExp("gmail.com")).required();
export const refreshToken = joi.string().required();
export const mobile = joi.number().min(10).max(10).required();
export const token = joi.string().required();

//Book
export const title = joi.string().required();
export const price = joi.number().required();
export const image = joi.string().required();
export const description = joi.string();
export const category = joi.array();
export const available = joi.number().required();
export const sold = joi.number();
export const totalRatings = joi.number();
export const bid = joi.string().required();

// ratings book
export const star = joi.number().required();
export const comment = joi.string();
export const bookId = joi.string().required();

//coupon book
export const titleCoupon = joi.string().required();
export const discount = joi.number().required();
export const expiry = joi.number().required();
