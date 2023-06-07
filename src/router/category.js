const router = require("express").Router();
const { CategoryController } = require("../controllers");
const { isAdminOrCreator } = require("../middleware/verify-role");
const verifyToken = require("../middleware/verify-token");
router.get("/", CategoryController.getCategories);
router.post(
  "/",
  [verifyToken, isAdminOrCreator],
  CategoryController.createCategory
);
router.patch(
  "/:cid",
  [verifyToken, isAdminOrCreator],
  CategoryController.repairCategory
);
router.delete(
  "/:cid",
  [verifyToken, isAdminOrCreator],
  CategoryController.deleteCategory
);

module.exports = router;
