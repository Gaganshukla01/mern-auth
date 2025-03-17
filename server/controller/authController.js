import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import userModel from "../model/userModel.js";

export const register= async(req,res)=>{

    const {name,email,password}=req.body
    console.log(req.body)

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
        
    } catch (error) {
        
        return res.json({sucess:false,message:error.message})
    }
}

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