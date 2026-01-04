// importing required modules
const express = require("express");
const path = require("path");
const rootDir = require("./utils/utilPath");
const hostRouter = require("./Routes/hostRouter");
const userRouter = require("./Routes/userRouter");
const { error } = require("./controllers/404");
require("dotenv").config();
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const authRouter = require("./Routes/authRouter");
const app = express();
const PORT = process.env.PORT || 3080;
const MONGO_URL = process.env.MONGO_URL;
const SQLdb = require("./utils/SQLdatabaseUtil");

// setting up view engine
app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

// multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
app.use(multer({ storage: storage }).single("photoUrl"));

// middleware setup
app.use(express.static(path.join(rootDir, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));

// session management
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

// setting local variables for views
app.use((req, res, next) => {
  res.locals.isLoggedin = req.session.isLoggedin || false;
  res.locals.user = req.session.user || null;
  next();
});

// route handling
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(authRouter);
app.use(userRouter);
app.use("/host", hostRouter);
app.use(error);

// connecting to MongoDB and starting the server
/*mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to Mongo");
    app.listen(PORT, () => {
      console.log(`server running on address  https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to Mongo: ", err);
  });*/
async function startServer() {
  try {
    await SQLdb.query("SELECT 1");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Mongo + MySQL connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}
startServer();
