const { clearHash } = require("../services/cache");


module.exports = async (req, res, next) => {
  // makes sure that next function which in this case is the route handler finishes execution before calling clearHash
  await next();

  clearHash(req.user.id);
};
