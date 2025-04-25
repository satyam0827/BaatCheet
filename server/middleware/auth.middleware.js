import User from "../models/user.schema.js"
import jwt from "jsonwebtoken"

export const protectedRoute =async(req,res,next)=>{

    try {
        const token = req.cookies.token;
        if(!token) return res.status(401).json({message:"Unauthorized - No token provided"});

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({message:"Unauthorized! - Invalid token"})
        }
        const user = await User.findById(decoded.userId).select("-password");
        req.user = user;
        next()
    } catch (error) {
        console.log("error in protectedRoute!",error.message)
        return res.status(500).json({message:"this Internal server error!"})
    }
}
