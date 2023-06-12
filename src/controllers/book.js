const joi = require("joi");
const slugify = require("slugify");
const { Types } = require("mongoose");
const { v2: cloudinary } = require("cloudinary");

const { Book, Category } = require("../models");
const handleErrors = require("../middleware/handle-errors");
const {
  title,
  price,
  image,
  description,
  category,
  available,
  star,
  comment,
  bookId,
} = require("../helpers/joi-schema");
// const data = require("../../data/data.json");

const BookController = {
  getBooks: async (req, res) => {
    try {
      const queries = { ...req.query };
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete queries[el]);

      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      const formatedQueries = JSON.parse(queryString);

      //Filtering
      if (queries?.title)
        formatedQueries.title = { $regex: queries.title, $options: "i" };

      const queryCommand = Book.find(formatedQueries);

      //Sorting
      if (req.query?.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand.sort(sortBy);
      }

      //fields
      if (req.query?.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand.select(fields);
      }

      //pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || +process.env.BOOKS_LIMIT;
      const skip = (page - 1) * limit;
      queryCommand.limit(limit).skip(skip);

      queryCommand
        .exec()
        .then(async (rs) => {
          const counts = await Book.find(formatedQueries).countDocuments();
          return res.status(200).json({
            err: rs ? 0 : 1,
            count: counts,
            book: rs,
          });
        })
        .catch((err) => {
          throw new Error(err);
        });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  createBook: async (req, res) => {
    const { error } = joi
      .object({
        title,
        price,
        image,
        description,
        category,
        available,
      })
      .validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const isChecked = await Book.findOne({ title: req.body.title });
      if (isChecked) return handleErrors.BadRequest("Title has exist", res);
      req.body.slug = slugify(req.body.title);
      const newBook = new Book(req.body);
      const response = await newBook.save();
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? response : "cann't create books",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  // insertData: async (req, res) => {
  //   try {
  //     const dataArr = Object(data.travel);
  //     // dataArr.forEach(async (item) => {
  //     //   const newCate = new Category({ title: item, slug: slugify(item) });
  //     //   await newCate.save();
  //     // });
  //     dataArr.forEach(async (item) => {
  //       console.log("Successfully");
  //       await Book.create({
  //         title: item.bookTitle,
  //         slug: slugify(item.bookTitle),
  //         price: item.bookPrice,
  //         category: "travel",
  //         sold: Math.round(Math.random() * 8000),
  //         image: { path: item.imageUrl },
  //         description: item.bookDescription,
  //         available: item.available,
  //       });
  //     });
  //     res.json("ok");
  //   } catch (err) {
  //     throw new Error(err);
  //   }
  // },

  getBookById: async (req, res) => {
    const { bid } = req.params;
    if (!Types.ObjectId.isValid(bid))
      return handleErrors.BadRequest("Invalid bookId", res);
    try {
      const response = await Book.findById(bid);
      res.status(200).json({
        err: response ? 0 : 1,
        bookData: response ? response : "Something went worng !",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  updateBook: async (req, res) => {
    const { bid } = req.params;
    if (!Types.ObjectId.isValid(bid))
      return handleErrors.BadRequest("Invalid bookId", res);
    try {
      if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
      const response = await Book.findByIdAndUpdate(bid, req.body, {
        new: true,
      });
      res.status(200).json({
        err: response ? 0 : 1,
        updatedBook: response ? response : "Cannot update book",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  //bug
  deleteBook: async (req, res) => {
    const { bid } = req.params;
    if (!Types.ObjectId.isValid(bid))
      return handleErrors.BadRequest("Invalid bookId", res);
    try {
      const response = await Book.findByIdAndDelete(bid);
      await cloudinary.uploader.destroy(response.filename);
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? "Delete successfully" : "BookId invalid",
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  ratings: async (req, res) => {
    const { _id } = req.user;
    const { error } = joi.object({ star, comment, bookId }).validate(req.body);
    if (error) return handleErrors.BadRequest(error?.details[0]?.message, res);
    try {
      const ratingBook = await Book.findById(req.body.bookId);
      const alreadyRating = ratingBook?.ratings?.find(
        (el) => el.postedBy.toString() === _id
      );

      if (alreadyRating) {
        //update star, comment
        await Book.updateOne(
          {
            ratings: { $elemMatch: alreadyRating },
          },
          {
            $set: {
              "ratings.$.star": req.body.star,
              "ratings.$.comment": req.body.comment,
            },
          },
          { new: true }
        );
      } else {
        // add star , comment, postedBy
        await Book.findByIdAndUpdate(
          req.body.bookId,
          {
            $push: {
              ratings: {
                star: req.body.star,
                comment: req.body.comment,
                postedBy: userId,
              },
            },
          },
          { new: true }
        );
      }
      const response = await Book.findById(req.body.bookId);
      const ratingsCount = response?.ratings.length;
      const sumRatings = response?.ratings.reduce(
        (sum, el) => sum + el.star,
        0
      );
      if (ratingsCount && sumRatings && response) {
        response.totalRatings =
          Math.round((sumRatings * 10) / ratingsCount) / 10;

        await response.save();
        res.status(200).json({
          err: 0,
          response,
        });
      }
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },

  uploadImageBook: async (req, res) => {
    const fileData = req.file;
    if (!fileData) return handleErrors.BadRequest("Missing input", res);
    const { bid } = req.params;
    if (!Types.ObjectId.isValid(bid)) {
      await cloudinary.uploader.destroy(fileData.filename);
      return handleErrors.BadRequest("Invalid Id", res);
    }
    try {
      const response = await Book.findByIdAndUpdate(
        bid,
        {
          image: {
            filename: fileData.filename,
            path: fileData.path,
          },
        },
        { new: true }
      );

      if (fileData && !response) {
        await cloudinary.uploader.destroy(fileData.filename);
      }
      res.status(200).json({
        err: response ? 0 : 1,
        mess: response ? "Updated" : "Something went worng !",
        data: response ? response : null,
      });
    } catch (err) {
      return handleErrors.InternalServerError(res);
    }
  },
};

module.exports = BookController;
