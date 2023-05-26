const createHttpError = require("http-errors");

const handleErrors = {
  BadRequest: (err, res) => {
    const error = createHttpError.BadRequest(err);
    return res.status(error.status).json({ error: 1, mes: error.message });
  },

  InternalServerError: (res) => {
    const error = createHttpError.InternalServerError();
    return res.status(error.status).json({ err: 1, mes: error.message });
  },

  NotFound: (req, res) => {
    const error = createHttpError.NotFound("This route is not defined");
    return res.status(error.status).json({ err: 1, mes: error.message });
  },

  UnAuth: (err, res, expired) => {
    const error = createHttpError.Unauthorized(err);
    return res
      .status(error.status)
      .json({ err: expired ? 2 : 1, mes: error.message });
  },
};

module.exports = handleErrors;
