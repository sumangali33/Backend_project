import { User } from "../models/user.model.js";
import  {ApiResponse}  from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userLogout=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
       $set:{refreshToken:""}
     },{new:true})
     const options={
       httpOnly : true,
       secure : true
       };
     res.status(200).clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(
       new ApiResponse(200,{},"User logged out successfully")
     )
});