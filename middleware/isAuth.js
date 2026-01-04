module.exports = (redirectTo) => {
  return (req, res, next) => {
    if (!req.session||!req.session.isLoggedin) {
      return res.redirect(redirectTo);
    }
    next();
  };
};
