const BookRoutes = require("./book");
const UserRoutes = require("./user");
const CouponRoutes = require("./coupon");
const handleErrors = require("../middleware/handle-errors");

const initRoutes = (app) => {
  app.use("/api/v1/book", BookRoutes);
  app.use("/api/v1/user", UserRoutes);
  app.use("/api/v1/coupon", CouponRoutes);
  app.use(handleErrors.NotFound);
};

module.exports = initRoutes;
