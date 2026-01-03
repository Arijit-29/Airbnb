const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  paymentId: { type: String, required: true },
});
module.exports = mongoose.model("Bookings", BookingSchema);