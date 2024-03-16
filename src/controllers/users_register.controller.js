import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse } from '../utils/apiResponse.js';
import {ApiError } from '../utils/apierror.js';
const registerUser = asyncHandler(async (req,res)=>{
    const {fullname, username, email,password} = req.body;

    if(
        [fullname, username, email, password].some(ele=>ele=== "")
    ){
       throw new ApiError(400, "all details required");
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    });

    if(existedUser){
        throw new ApiError(400, "User already exist");
    }
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(avatarLocalPath === undefined){
        throw new ApiError(400, "avatar file is not found");
    }

    const avatarImageUrl = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarImageUrl){
        throw new ApiError(400, "avatar file is not uploaded to cloudinary");
    }
    
    const user = await User.create({
        fullname,
        username,
        email,
        password,
        avatar:{
            avatarImage:avatarImageUrl.url,
            avatarImagePublicId:avatarImageUrl.public_id
        },
        coverImage : {
            coverImage:coverImageUrl?.url || "",
            coverImagePublicId:coverImageUrl.public_id
        }
    });

    const createUser =await User.findById(user._id).select("-password -refreshToken");
    res.status(201).json(
        new ApiResponse(201, createUser, "Ok")
    )
})

export {registerUser};