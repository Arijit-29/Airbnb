const express=require('express')
const userRouter=express.Router()
const homesController=require("../controllers/homes")
const paymentController=require("../controllers/payment")
const isAuth=require("../middleware/isAuth")
const isGuest=require("../middleware/isGuest")
userRouter.get("/",homesController.getHomes)
userRouter.get("/bookings",isAuth("/login"),isGuest,homesController.getBookings)
userRouter.post("/bookings",isAuth("/login"),isGuest,homesController.postBookings)
userRouter.get("/favourites",isAuth("/login"),isGuest,homesController.getFavourites)
userRouter.get("/homes/:homeId",isAuth("/login"),homesController.gethomeDetails)
userRouter.post("/favourites",isAuth("/login"),isGuest,homesController.postFavourites)
userRouter.post("/favourites/delete/:homeId",isAuth("/login"),isGuest,homesController.postdeleteFavourites)
userRouter.post("/bookings/pay",isAuth("/login"),isGuest,paymentController.createOrder);
userRouter.post("/bookings/verify",isAuth("/login"),isGuest,paymentController.verifyBookingPayment);
module.exports=userRouter
