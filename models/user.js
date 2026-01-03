const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
  hostPaymentStatus: {
    type: String,
    enum: ["PENDING", "SUCCESS"],
    default: "PENDING"
  },
  razorpayPaymentId: String,
  razorpayOrderId: String
});
const User = mongoose.model('User', userSchema);
module.exports = User;