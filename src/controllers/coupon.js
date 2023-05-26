import { Coupon } from "../models";
import handleErrors from "../middleware/handle-errors";
import { titleCoupon, discount, expiry } from "../helpers/joi_schema";
import Joi from "joi";

const couponController = {
  getAllCoupons: async (req, res) => {
    try {
      const response = await Coupon.find().select("-createdAt -updatedAt");
      res.status(200).json({
        err: response ? 0 : 1,
        couponData: response ? response : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  createCoupon: async (req, res) => {
    const { error } = Joi.object({ titleCoupon, discount, expiry }).validate(
      req.body
    );
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const ischecked = await Coupon.findOne({
        titleCoupon: coupon?.titleCoupon,
      });
      if (ischecked)
        return handleErrors.BadRequest("title coupon exsited", res);
      const newCoupon = new Coupon({
        ...req.body,
        expiry: Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000,
      });
      const response = await newCoupon.save();
      res.status(200).json({
        err: response ? 0 : 1,
        data: response ? response : "cannot create coupon",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  repairCoupon: async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error("Missing input");
    try {
      const { couponId } = req.params;
      if (req.body.expiry)
        req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000;
      const response = await Coupon.findByIdAndUpdate(couponId, req.body, {
        new: true,
      });
      res.status(200).json({
        err: response ? 0 : 1,
        data: response ? response : "couponId invalid",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  deleteCoupon: async (req, res) => {
    try {
      const { couponId } = req.params;
      const response = await Coupon.findByIdAndDelete(couponId);
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? "delete successfully" : "couponId invalid",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },
};

export default couponController;
