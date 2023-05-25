import { Schema, Types, model } from "mongoose";

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
    paymentIntent: {},
    orderBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);
export default Order;
