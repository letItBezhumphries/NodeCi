const { clearHash } = require("../services/cache");

/* 
Because we might not want to immediately clear the cache when the rought handler is run 
but only when the post is created then use this trick by making use of async await and 
waiting for the other next functions to be done before calling the clearHash function
calling next to finish the rest 

*/

module.exports = async (req, res, next) => {
  // makes sure that next function which in this case is the route handler finishes execution before calling clearHash
  await next();

  clearHash(req.user.id);
};
