const Razorpay = require("razorpay");
require("dotenv").config();
const crypto = require("crypto");
const Bookings = require("../models/bookings");
const Home = require("../models/home");
const User = require("../models/user");
const instance = new Razorpay({
    key_id: process.env.TEST_API_KEY,
    key_secret: process.env.TEST_KEY_SECRET,
});
exports.createOrder = async (req, res) => {
    try {
        const homeId = req.body.homeId;
        const [homes] = await Home.findById(homeId);
        const home = homes[0];
        if (!home) {
            return res.status(404).send("Home not found");
        }
        const amountInPaise = Math.round(Number(home.price) * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `booking_${Date.now()}`,
        };
        const order = await instance.orders.create(options);
        res.render("store/payment", {
            key: process.env.TEST_API_KEY,
            orderId: order.id,
            amount: order.amount,
            homeId,
            user: req.session.user,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send("payment failed");
    }
};
exports.verifyBookingPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, homeId } =
            req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.TEST_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).send("Payment verification failed");
        }
        const booking = new Bookings({
            id: homeId,
            userId: req.session.user._id,
            paymentId: razorpay_payment_id,
        });
        await booking.save();
        res.redirect("/bookings");
    } catch (err) {
        console.log(err);
        res.status(500).send("Payment verification error");
    }
};
exports.createHostOrder = async (req, res) => {
    try {
        if (!req.session.tempUser) {
            return res.redirect("/sign-up");
        }
        const options = {
            amount: 19 * 100,
            currency: "INR",
            receipt: "host_signup_" + Date.now()
        };
        const order = await instance.orders.create(options);
        res.render("host/host-payments", {
            key: process.env.TEST_API_KEY,
            amount: order.amount,
            orderId: order.id,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Unable to initiate host payment");
    };
}
exports.verifyHostPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expected = crypto
            .createHmac("sha256", process.env.TEST_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expected !== razorpay_signature) {
            return res.status(400).send("Payment verification failed");
        }
        const temp = req.session.tempUser;
        const user = new User({
            ...temp,
            hostPaymentStatus: "SUCCESS",
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
        });

        await user.save();

        req.session.user = user;
        req.session.isLoggedin = true;
        delete req.session.tempUser;

        req.session.save(() => {
            res.redirect("/");
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Payment verification error");
    }
}
    
