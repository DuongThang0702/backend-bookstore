const joi = require("joi");

const { Category } = require("../models");
const handleErrors = require("../middleware/handle-errors");
const { title } = require("../helpers/joi-schema");
const { Types } = require("mongoose");
const { default: slugify } = require("slugify");
const CategoryController = {
  getCategories: async (req, res) => {
    try {
      const response = await Category.find();
      res.status(200).json({
        error: response ? 0 : 1,
        data: response ? response : "Something went wrong",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  createCategory: async (req, res) => {
    const { error } = joi.object({ title }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const { title } = req.body;
      const isChecked = await Category.findOne({ title, slug: slugify(title) });
      if (isChecked) return handleErrors.BadRequest("title has existed", res);
      const newCategory = new Category({ title });
      const response = await newCategory.save();
      res.status(200).json({
        error: response ? 0 : 1,
        response: response ? response : "Something went wrong",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  deleteCategory: async (req, res) => {
    const { cid } = req.params;
    if (!Types.ObjectId.isValid(cid))
      return handleErrors.BadRequest("invalid Category id", res);
    try {
      const response = await Category.findByIdAndDelete(cid);
      res.status(200).json({
        error: response ? 0 : 1,
        mes: response ? "Category deleted" : "invalid Category id",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  repairCategory: async (req, res) => {
    const { cid } = req.params;
    if (!Types.ObjectId.isValid(cid))
      return handleErrors.BadRequest("invalid Category id", res);
    try {
      const { title } = req.body;
      const response = await Category.findByIdAndUpdate(
        cid,
        { title, slug: slugify(title) },
        {
          new: true,
        }
      );
      res.status(200).json({
        error: response ? 0 : 1,
        response: response ? response : "invalid Category id",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },
};

module.exports = CategoryController;
