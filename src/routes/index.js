import BookRoutes from "./book";
import UserRoutes from "./user";
import CouponRoutes from "./coupon";
import handleErrors from "../middleware/handle-errors";

const initRoutes = (app) => {
  app.use("/api/v1/book", BookRoutes);
  app.use("/api/v1/user", UserRoutes);
  app.use("/api/v1/coupon", CouponRoutes);
  app.use(handleErrors.NotFound);
};

export default initRoutes;
