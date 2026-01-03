module.exports = (req, res, next) => {
  if (!req.session.isLoggedin || req.session.user.userType !== "guest") {
    return res.status(403).redirect("/");
  }
  next();
};
