const express = require("express");

const { BookController } = require("../controllers");
const verifyToken = require("../middleware/verify-token");
const { isAdminOrCreator } = require("../middleware/verify-role");
const uploader = require("../config/cloudinary-config");
const router = express.Router();

router.get("/", BookController.getBooks);
router.get("/book-id/:bid", BookController.getBookById);

//private
router.post("/ratings", verifyToken, BookController.ratings);
// router.post(
//   "/upload-image/:bid",
//   [verifyToken, isAdminOrCreator],
//   uploader.single("image-book"),
//   BookController.uploadImageBook
// );
router.post(
  "/",
  [verifyToken, isAdminOrCreator],
  uploader.single("image"),
  BookController.createBook
);
router.patch(
  "/:bid",
  [verifyToken, isAdminOrCreator],
  uploader.single("image"),
  BookController.updateBook
);
router.delete(
  "/:bid",
  [verifyToken, isAdminOrCreator],
  BookController.deleteBook
);

// router.get("/insert-data", BookController.insertData);

module.exports = router;
