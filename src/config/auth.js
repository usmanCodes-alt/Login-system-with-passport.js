const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
};

const isNotAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/home");
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
