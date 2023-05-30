const { User, Order, Coupon } = require("../models");
const handleError = require("../middleware/handle-errors");
const { Types } = require("mongoose");

const orderController = {
  createOrder: async (req, res) => {
    const { _id } = req.user;
    const { coupon } = req.body;
    if (coupon) {
      const isCheckId = Types.ObjectId.isValid(coupon);
      if (!isCheckId) return handleError.BadRequest("Invalid coupon", res);
    }
    try {
      const userCart = await User.findById(_id)
        .select("cart")
        .populate("cart.bid", "title price");
      const books = userCart?.cart?.map((el) => ({
        book: el.bid._id,
        count: el.quantity,
      }));
      let total = userCart?.cart?.reduce(
        (sum, el) => el.bid.price * el.quantity + sum,
        0
      );
      const createData = { books, total: Math.round(total), orderBy: _id };
      if (coupon) {
        const isCoupon = await Coupon.findById(coupon);
        total = Math.round(total * (1 - +isCoupon.discount / 100));
        createData.total = total;
        createData.coupon = coupon;
      }
      const response = await Order.create(createData);
      res.status(200).json({
        err: response ? 0 : 1,
        cart: response ? response : "Something went wrong !",
      });
    } catch (err) {
      return handleError.InternalServerError(res);
    }
  },

  getOrderByUser: async (req, res) => {
    try {
      const { _id } = req?.user;
      const response = await Order.findOne({ orderBy: _id });
      res.status(200).json({
        err: response ? 0 : 1,
        response: response ? response : "Something went wrong !",
      });
    } catch (err) {
      return handleError.InternalServerError(res);
    }
  },

  getOrderByAdmin: async (req, res) => {
    try {
      const response = await Order.find();
      res.status(200).json({
        err: response ? 0 : 1,
        data: response ? response : "Something went wrong !",
      });
    } catch (err) {
      return handleError.InternalServerError(res);
    }
  },

  updateStatus: async (req, res) => {
    const { oid } = req.params;
    const { status } = req.body;
    if (!status) return handleError.BadRequest("Missing status", res);
    try {
      const response = await Order.findByIdAndUpdate(oid, status, {
        new: true,
      });
      res.status(200).json({
        err: response ? 0 : 1,
        response: response ? response : "Something went wrong !",
      });
    } catch (err) {
      return handleError.InternalServerError(res);
    }
  },
};
//3449.6
module.exports = orderController;
