const router = require("express").Router();

const { OrderController } = require("../controllers");
const verifyToken = require("../middleware/verify-token");
const { isAdminOrCreator } = require("../middleware/verify-role");

router.get("/", verifyToken, OrderController.getOrderByUser);
router.get(
  "/admin",
  [verifyToken, isAdminOrCreator],
  OrderController.getOrderByAdmin
);
router.post("/", verifyToken, OrderController.createOrder);
router.patch(
  "/status/:oid",
  [verifyToken, isAdminOrCreator],
  OrderController.updateStatus
);

module.exports = router;
