import handleErrors from "./handle_error";

export const isAdmin = (req, res, next) => {
  const userRole = req.user?.role;
  if (userRole !== "admin")
    return handleErrors.UnAuth("Require role Admin", res, false);
  next();
};

export const isAdminOrCreator = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole !== "admin" && userRole !== "creator")
    return handleErrors.UnAuth("Require role Admin or Creator", res, false);
  next();
};
