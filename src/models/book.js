const { Schema, Types, model } = require("mongoose");

const BookSchema = new Schema(
  {
    title: { type: String, require: true, unique: true },
    slug: { type: String, unique: true, lowercase: true, require: true },
    price: { type: Number, require: true },
    category: { type: Array, require: true },
    sold: { type: Number, default: 0 },
    image: {
      filename: {
        type: String,
        default: "",
      },
      path: { type: String, unique: true },
    },

    description: { type: String, default: "" },
    available: { type: Number, default: 0 },
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

module.exports = Book;
