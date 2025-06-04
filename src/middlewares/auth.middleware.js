import { User } from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import asyncHanlder from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJWT = asyncHanlder(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
    if(!token){
        throw new ApiError(401,"Unauthorized");
    }

    const decoded = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

    if(!decoded){
        throw new ApiError(401, "Unauthorized")
    }

    const user = User.findById(decoded?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid token");
    }

    req.user = user;
    next()


})

export {verifyJWT}