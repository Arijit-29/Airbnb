exports.error = (req, res, next) => {
  res
    .status(404)
    .render("404", { pageTitle: "Error", isLoggedin: req.isLoggedin });
};
