import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import userModel from "../model/userModel.js";
import transporter from "../config/nodeMailer.js";

// for regiter new user
export const register= async(req,res)=>{

    const {name,email,password}=req.body
    
    if(!name || !email || !password){

         return res.json({sucess:false,message:"Missing Details"})
    }

    try {

        const existingUser=await userModel.findOne({email})

        if(existingUser){
            return res.json({sucess:false,message:"User Already Found.."})
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const user=new userModel({name,email,password:hashedPassword})
        
        await user.save()

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });

        // send mail
        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:"Welocme to Auth",
            text:`Welcome to auth website,Your account has been created with email id ${email}`
        }

        await transporter.sendMail(mailOption)
        return res.json({sucess:true,message:"Registered"})
        
    } catch (error) {
        
        return res.json({sucess:false,message:error.message})
    }


    
}

// for login user
export const login=async(req,res)=>{

    const {email,password}=req.body

    if(!email || !password){

        return res.json({sucess:false,message:"Fill email and password.."})
   }

   const user= await userModel.findOne({email})

   if(!user){
    return res.json({sucess:false,message:"email is  not valid."})
   }

   const isMatched=await bcrypt.compare(password,user.password)

   if(!isMatched){
    return res.json({sucess:false,message:"Invalid password"})
   }

   const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

   res.cookie('token',token,{
       httpOnly:true,
       secure:process.env.NODE_ENV==='production',
       sameSite:process.env.NODE_ENV==='production'?'none':'strict',
       maxAge:7*24*60*60*1000
   });

   return res.json({sucess:true})

}

// for logout user
export const logout =async (req,res)=>{

    try {

        res.clearCookie('token',{

            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',

        })
        
    } catch (error) {
        return res.json({sucess:false,message:"Error"})
    }
   return res.json({success:true,message:"LoggedOut"})
}

// sending otp to mail
export const sendVerifyOtp= async (req,res)=>{
     
    try {
        const {userId}=req.body
        const user= await userModel.findById(userId)

        if(user.isAccountVerified){

            return res.json({success:true,message:"Account is already verified"})
        }
        
        const otp=String(Math.floor(100000+Math.random()*900000))

        user.verifyOtp=otp
        user.verifyOtpExpireAt=Date.now()+(24*60*60*1000)
        user.save()

        // send otp to mail
        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Your Verification OTP",
            text:`Verification OTP is ${otp} use this for verification`
        }

       await  transporter.sendMail(mailOption)
       return res.json({sucess:true,message:"OTP SENDED"})

    } catch (error) {
          return res.json({success:false,message:"error"})
    }
}

// take otp from user and verify that
export const verifyEmail= async (req,res)=>{

    const {userId ,otp}=req.body
    

    if(!userId ||!otp){
        return res.json({success:false,message:"Missing Deatils"})
    }

    try {
        const user= await userModel.findById(userId)
        if(!user){
            return res.json({success:false,message:"User Not Found!!"})
        }

        if(user.verifyOtp==='' || user.verifyOtp!==otp){
            return res.json({success:false,message:"Invalid OTP"})
        }

        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:"OTP Expired.."})
        }
            user.isAccountVerified=true;
            user.verifyOtp='';
            user.verifyOtpExpireAt=0;
            await user.save()
            return res.json({sucess:true,mesage:"Account is verified.."})
        
    } catch (error) {
        return res.json({success:false,message:"error"})
    }

}

// user is verified or not ..
export const isAuthenticated=async (req,res)=>{
    try {

        return res.json({sucess:true,mesage:"User is Autheticated"})
        
    } catch (error) {
        
        return res.json({sucess:true,message:"Login Again User is not authenticated."})
    }
}

// resetPassword otp sending
export const resetPasswordOtp=async(req,res)=>{

    const {email}=req.body
    
    if(!email){
        return res.json({success:false,message:"Email required."})
    }

    try {
        const user=await userModel.findOne({email:email})

        if(!user){
            return res.json({sucess:false,message:"user not found"})
        }

        const otp=String(Math.floor(100000+Math.random()*900000))

        user.resetOtp=otp
        user.resetOtpExpireAt=Date.now()+(15*60*1000)
        await user.save()

        // send otp to mail
        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Your Password Reset  OTP",
            text:`Password Reset OTP is ${otp} use this for change password`
        }

        await transporter.sendMail(mailOption)
        return res.json({sucess:true,message:"OTP sended to your registered mail id"})

    } catch (error) {
        return res.json({success:false,message:error.message})
    }

}

// Reset User Password
export const resetPassword=async(req,res)=>{

    const{email,otp,newPassword}=req.body
    console.log(otp)

    if(!email || !otp || !newPassword){
        return res.json({sucess:false,message:"Empty Field is not allowed"})
    }
    try {

        const user= await userModel.findOne({email:email})
        if(user.resetOtp==='' || user.resetOtp!=otp){
            console.log(user.resetOtp)
            return res.json({sucess:false,message:"Otp does not match"})
        }
        if(user.resetOtpExpireAt<Date.now()){
            return res.json({sucess:false,message:"Otp expired"})
        }
        const hashedPassword=await bcrypt.hash(newPassword,10)
        user.password=hashedPassword
        user.resetOtp=''
        user.resetOtpExpireAt=0

        user.save()

        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Your Password Changed Sucesfully",
            text:`Password Reset Sucessfully for emailId:${email}`
        }

        await transporter.sendMail(mailOption)
        return res.json({sucess:true,message:"Password Changed Sucesfully."})
        
    } catch (error) {
        return res.json({sucess:false,message:"Error Occured"})
    }
}