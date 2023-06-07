const BookRoutes = require("./book");
const UserRoutes = require("./user");
const CouponRoutes = require("./coupon");
const OrderRoutes = require("./order");
const CategoryRoutes = require("./category");
const handleErrors = require("../middleware/handle-errors");

const initRoutes = (app) => {
  app.use("/api/v1/book", BookRoutes);
  app.use("/api/v1/user", UserRoutes);
  app.use("/api/v1/coupon", CouponRoutes);
  app.use("/api/v1/order", OrderRoutes);
  app.use("/api/v1/category", CategoryRoutes);
  app.use(handleErrors.NotFound);
};

module.exports = initRoutes;
