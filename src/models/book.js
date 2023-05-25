import { Schema, Types, model } from "mongoose";

const BookSchema = new Schema(
  {
    title: { type: String, require: true, unique: true },
    slug: { type: String, unique: true, lowercase: true, require: true },
    price: { type: Number, require: true },
    category: { type: [String] },
    image: [{ type: String }],
    description: { type: String },
    available: { type: Number },
    sold: { type: Number, default: 0 },
    ratings: [
      {
        star: { type: Number },
        postedBy: { type: Types.ObjectId, ref: "User" },
        comment: { type: String },
      },
    ],
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Book = model("Book", BookSchema);

export default Book;
