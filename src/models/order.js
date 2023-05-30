const { Schema, Types, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    books: [
      {
        book: { type: Types.ObjectId, ref: "Book" },
        count: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      default: "Processing",
      enum: ["Successed", "Cancelled", "Processing"],
    },
    total: Number,
    coupon: { type: Types.ObjectId, ref: "Coupon" },
    orderBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);
module.exports = Order;
