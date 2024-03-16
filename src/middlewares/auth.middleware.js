import {asyncHandler} from "../utils/asyncHandler.js"
import  {ApiError} from "../utils/apierror.js"
import  Jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyUserLogin =asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(400,"Unauthorized user");
        }
    
        const decodedUser=Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user =await User.findById(decodedUser?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(400,"AccessToken not found")
        }
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(error);
    }
})