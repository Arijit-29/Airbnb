const mongoose = require("mongoose");
const favSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }
});
module.exports = mongoose.model("Favourites", favSchema);