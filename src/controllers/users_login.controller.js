import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js';
import {ApiResponse } from '../utils/apiResponse.js';
import {ApiError } from '../utils/apierror.js';
import {generateAcessAndRefreshTokens} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';


export const userLogin = asyncHandler(async (req,res)=>{
    const{username,email, password} = req.body;
    if(!username || !email){
        throw new ApiError(400, "username or email is required");
    }
    if(!password){
        throw new ApiError(400, "password is required");
    }
    const isRegistered = await User.findOne({
        $or : [
            {username}, {email}
        ]
    });
    if(!isRegistered){
        throw new ApiError(400, "user Not found, Please register");
    }
    const isCorrectPassword =await isRegistered.isPasswordCorrect(password);
    if(!isCorrectPassword){
        throw new ApiError(400, "Incorrect password");
    };

    const tokens = await generateAcessAndRefreshTokens(isRegistered._id);
    
    const loginUserData = await User.findById(isRegistered._id).select("-password -refreshToken")
    const options={
        httpOnly : true,
        secure : true
    };

    res.status(200).cookie("accessToken",tokens.accessToken,options)
    .cookie("refreshToken",tokens.refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loginUserData,
            accessToken : tokens.accessToken,
            refreshToken: tokens.refreshToken
        },"ok")
    )
});




export const refershAccessToken = asyncHandler(async (req, res)=>{
   const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(400, "Unauthorized access");
        }

        const decodedData = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedData._id);

        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
        
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(400, "invalid access token");
        }

        const tokens =await generateAcessAndRefreshTokens(user._id);
        
        const options = {
            httpOnly : true,
            secure : true
        }

        res.status(200).cookie("accessToken",tokens.accessToken, options)
        .cookie("refreshToken", tokens.refreshToken, options).json(
            new ApiResponse(200, {accessToken : tokens.accessToken,
            refreshToken : tokens.refreshToken}, "accessToken refreshed successfull")
        )
})



