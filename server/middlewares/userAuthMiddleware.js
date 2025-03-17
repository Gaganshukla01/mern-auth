import jwt from "jsonwebtoken";

// for setting user id to body from token
const userAuth=async(req,res,next)=>{

    const {token}=req.cookies;

    if(!token){
        return res.json({sucess:true,message:"Not Authorised Login Again "})
    }

    try {

        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)

        if(tokenDecode.id){
            req.body.userId=tokenDecode.id
        }
        else{
          
            return res.json({sucess:true,message:"Not Authorised Login Again "})
        }

        next()
        
    } catch (error) {
        return res.json({sucess:true,message:message.error})
    }

}

export default userAuth;
