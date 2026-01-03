const express=require('express')
const authRouter=express.Router()
const authController=require("../controllers/auths")
const paymentController=require("../controllers/payment")
authRouter.get("/login",authController.getLogin)
authRouter.post("/login",authController.postLogin)
authRouter.post("/logout",authController.postLogout)
authRouter.get("/sign-up",authController.getSignup)
authRouter.post("/sign-up",authController.postSignup)
authRouter.get("/host/payment", paymentController.createHostOrder);
authRouter.post("/host/payment/verify", paymentController.verifyHostPayment);
module.exports=authRouter