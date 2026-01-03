module.exports = (req, res, next) => {
  if (!req.session.isLoggedin || req.session.user.userType !== "host") {
    return res.status(403).redirect("/");
  }
  next();
};
