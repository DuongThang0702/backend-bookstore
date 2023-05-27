const express = require("express");

const { BookController } = require("../controllers");
const verifyToken = require("../middleware/verify-token");
const { isAdminOrCreator } = require("../middleware/verify-role");
const uploader = require("../config/cloudinary-config");
const router = express.Router();

router.get("/all-book", BookController.getBooks);
router.get("/book-id/:bid", BookController.getBookById);

router.post(
  "/upload-image/:bid",
  uploader.array("image-book", 10),
  BookController.updateImageBook
);
//private
router.post("/ratings", verifyToken, BookController.ratings);
router.post("/", [verifyToken, isAdminOrCreator], BookController.createBook);
router.patch(
  "/:bid",
  [verifyToken, isAdminOrCreator],
  BookController.updateBook
);
router.delete(
  "/:bid",
  [verifyToken, isAdminOrCreator],
  BookController.deleteBook
);

module.exports = router;
