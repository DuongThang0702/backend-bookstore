import express from "express";

import { BookController } from "../controllers";
import verifyToken from "../middleware/verify-token";
import { isAdminOrCreator } from "../middleware/verify-role";

const router = express.Router();

router.get("/all-book", BookController.getBooks);
router.get("/book-id/:bid", BookController.getBookById);
router.use(verifyToken);
router.post("/ratings", BookController.ratings);
router.use(isAdminOrCreator);
router.post("/", BookController.createBook);
router.patch("/:bid", BookController.updateBook);
router.delete("/:bid", BookController.deleteBook);

export default router;
