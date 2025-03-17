import express from "express"
import { login, logout, register } from "../controller/authController.js"

export const authRoute=express.Router()

authRoute.post("/register",register)
authRoute.post("/login",login)
authRoute.post("/logout",logout)

