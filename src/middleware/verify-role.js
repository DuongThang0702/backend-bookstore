const handleErrors = require("./handle-errors");

const isAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") return handleErrors.UnAuth("Require role Admin", res);
  next();
};

const isAdminOrCreator = (req, res, next) => {
  const { role } = req.user;
  if (role === "admin" || role === "creator") {
    next();
  } else {
    return handleErrors.UnAuth("Require role Admin or Creator", res);
  }
};

module.exports = { isAdmin, isAdminOrCreator };
