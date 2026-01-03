const Favourites = require("../models/favourites");
const Bookings = require("../models/bookings");
const Home = require("../models/home");
const { error } = require("./404");
const fs = require("fs");
const path = require("path");
exports.getAddHome = (req, res, next) => {
  res.render("host/add-home", {
    pageTitle: "add-home",
    editing: false,
    //isLoggedin: req.isLoggedin,
    user: req.session.user,
  });
};
exports.postAddHome = (req, res, next) => {
  const photo = req.file ? "/uploads/" + req.file.filename : req.body.photoUrl;
  const rating = (Math.random() * (5 - 3) + 3).toFixed(1);
  const home = new Home(
    null,
    req.body.houseName,
    req.body.price,
    req.body.location,
    rating,
    photo,
    req.body.description,
    req.session.user._id
  );
  home
    .save()
    .then(() => {
      res.render("host/submit", {
        pageTitle: "submit",
        //isLoggedin: req.isLoggedin,
        user: req.session.user,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.getHomes = (req, res, next) => {
  Home.fetchAll().then(([registeredHomes]) => {
    res.render("store/welcome", {
      registeredHomes: registeredHomes,
      pageTitle: "welcome",
      //isLoggedin: req.isLoggedin,
      user: req.session.user,
    });
  });
};

exports.getFavourites = (req, res, next) => {
  Favourites.find({ userId: req.session.user._id }).then((favourites) => {
    const favIds = favourites.map((fav) => fav.id);
    Home.fetchAll().then(([registeredHomes]) => {
      const favouritesWithDetails = favIds
        .map((homeId) => registeredHomes.find((home) => home.id === homeId))
        .filter((home) => home !== undefined);
      res.render("store/favourites", {
        favourites: favouritesWithDetails,
        pageTitle: "favourites",
        //isLoggedin: req.isLoggedin,
        user: req.session.user,
      });
    });
  });
};
exports.getHostHomes = (req, res, next) => {
  Home.fetchAllByOwner(req.session.user._id).then(([registeredHomes]) =>
    res.render("host/host-homes", {
      registeredHomes: registeredHomes,
      pageTitle: "host-homes",
      //isLoggedin: req.isLoggedin,
      user: req.session.user,
    })
  );
};
exports.gethomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId)
    .then(([homes]) => {
      const home = homes[0];
      if (!home) {
        res.redirect("/");
      } else {
        res.render("store/home-details", {
          pageTitle: "home-details",
          home: home,
          //isLoggedin: req.isLoggedin,
          user: req.session.user,
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.postFavourites = async (req, res, next) => {
  try {
    const homeId = Number(req.body.id);
    const existing = await Favourites.findOne({
      id: homeId,
      userId: req.session.user._id,
    });
    if (existing) {
      console.log("Already in favourites");
      return res.redirect("/favourites");
    }
    const fav = new Favourites({ id: homeId, userId: req.session.user._id });
    await fav.save();

    console.log("Added to favourites:", homeId);
    res.redirect("/favourites");
  } catch (err) {
    console.log("Error while marking fav:", err);
    res.status(500).send("Error adding favourite");
  }
};
exports.geteditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId)
    .then(([homes]) => {
      const home = homes[0];
      if (!home) {
        console.log("home not found");
        return res.redirect("/host/host-homes");
      }
      const storedOwnerId = home.ownerId.replace(/['"]/g, "").trim();
      const sessionOwnerId = req.session.user._id.toString();
      console.log("Cleaned home.ownerId:", storedOwnerId);
      console.log("Session ownerId:", sessionOwnerId);
      console.log("Match:", storedOwnerId === sessionOwnerId);
      if (storedOwnerId !== sessionOwnerId) {
        console.log("⚠️ Owner mismatch - redirecting to home");
        return res.redirect("/");
      }
      console.log(homeId, editing, home);
      res.render("host/add-home", {
        pageTitle: "edit-home",
        editing: editing,
        home: home,
        user: req.session.user,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.posteditHome = (req, res, next) => {
  const ownerId = req.session.user._id;
  const homeId = req.body.id;
  Home.findById(homeId)
    .then(([homes]) => {
      const homeData = homes[0];
      if (!homeData) {
        console.log("Home not found");
        return res.redirect("/host/host-homes");
      }
      const storedOwnerId = homeData.ownerId.replace(/['"]/g, "").trim();
      const sessionOwnerId = ownerId.toString();
      console.log("Stored ownerId:", storedOwnerId);
      console.log("Session ownerId:", sessionOwnerId);
      if (storedOwnerId !== sessionOwnerId) {
        console.log("⚠️ Unauthorized - not the owner");
        return res.redirect("/");
      }
      const oldPhoto = req.body.existingPhotoUrl;
      const photo = req.file ? "/uploads/" + req.file.filename : oldPhoto;
      if (req.file && oldPhoto) {
        const oldPhotoPath = path.join(
          __dirname,
          "..",
          oldPhoto.replace("/", "")
        );
        fs.existsSync(oldPhotoPath) && fs.unlinkSync(oldPhotoPath);
      }
      const rating = req.body.rating ? req.body.rating : homeData.rating;
      const home = new Home(
        req.body.id,
        req.body.houseName,
        req.body.price,
        req.body.location,
        rating,
        photo,
        req.body.description,
        homeData.ownerId
      );
      console.log("Editing home:", req.body);
      return home.save();
    })
    .then(() => {
      res.redirect("/host/host-homes");
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.postdeleteHome = async (req, res, next) => {
  try {
    const ownerId = req.session.user._id;
    const homeId = req.params.homeId;
    const [homes] = await Home.findById(homeId);
    const home = homes[0];
    if (!home) {
      console.log("Home not found.");
      return res.redirect("/host/host-homes");
    }
    const storedOwnerId = home.ownerId.toString().replace(/['"]/g, "").trim();
    const currentUserId = ownerId.toString().replace(/['"]/g, "").trim();
    if (storedOwnerId !== currentUserId) {
      console.log("Unauthorized: You do not own this home.");
      return res.redirect("/host/host-homes");
    }
    await Home.deleteById(homeId);
    await Favourites.deleteMany({ id: homeId });
    res.redirect("/host/host-homes");
  } catch (error) {
    console.log(error);
  }
};
exports.postdeleteFavourites = async (req, res, next) => {
  try {
    const homeId = Number(req.params.homeId);
    const result = await Favourites.deleteOne({
      id: homeId,
      userId: req.session.user._id,
    });
    console.log("Favourite removed:", result);
    res.redirect("/favourites");
  } catch (err) {
    console.log("Error while deleting favourite:", err);
    res.status(500).send("Error deleting favourite");
  }
};
exports.postBookings = async (req, res, next) => {
  try {
    const homeId = Number(req.body.id);
    const existing = await Bookings.findOne({
      id: homeId,
      userId: req.session.user._id,
    });
    if (existing) {
      console.log("Already in bookings");
      return res.redirect("/Bookings");
    }
    const booking = new Bookings({ id: homeId, userId: req.session.user._id });
    await booking.save();

    console.log("Added to Bookings:", homeId);
    res.redirect("/Bookings");
  } catch (err) {
    console.log("Error while booking:", err);
    res.status(500).send("Error adding bookings");
  }
};
exports.getBookings = (req, res, next) => {
  Bookings.find({ userId: req.session.user._id }).then((bookings) => {
    const bookingIds = bookings.map((booking) => booking.id);
    Home.fetchAll().then(([registeredHomes]) => {
      const BookingWithDetails = bookingIds
        .map((homeId) => registeredHomes.find((home) => home.id === homeId))
        .filter((home) => home !== undefined);
      res.render("store/Bookings", {
        bookings: BookingWithDetails,
        pageTitle: "Bookings",
        user: req.session.user,
      });
    });
  });
};
