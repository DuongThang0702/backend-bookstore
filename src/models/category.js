const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    title: { type: String, unique: true, require: true },
  },
  { timestamps: true }
);

const categoryModel = model("CategoryBook", categorySchema);
module.exports = categoryModel;
