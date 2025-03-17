import express from "express"
import userAuth from "../middlewares/userAuthMiddleware.js"
import { login, logout, register , sendVerifyOtp ,verifyEmail,isAuthenticated ,resetPasswordOtp,resetPassword} from "../controller/authController.js"

export const authRoute=express.Router()

authRoute.post("/login",login)
authRoute.post("/logout",logout)
authRoute.post("/register",register)
authRoute.post("/resetotp",resetPasswordOtp)
authRoute.post("/resetpassword",resetPassword)
authRoute.post("/verifyemail",userAuth,verifyEmail)
authRoute.post("/sendverifyOtp",userAuth,sendVerifyOtp)
authRoute.post("/isAuthenticate",userAuth,isAuthenticated)

