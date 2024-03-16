
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary,deleteFileFromCloudinary } from "../utils/cloudinary.js";

export const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword && !newPassword){
        throw new ApiError(400,"oldPassword and newPassword are required");
    }

    const user =await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(400,"user not found!");
    }

    const passwordVerified=await user.isPasswordCorrect(oldPassword);

    if(!passwordVerified){
        throw new ApiError(400,"Enter the correct old Password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,{},"password updated successfully")
    )
});

export const changeDetails=asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body;
    if(!fullname && !email){
        throw new ApiError(400,"All details are required");
    }
    const user=await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400,"Please login");
    }
   const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{fullname,email}},
        {new:true}
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200,{updatedUser},"User details updated successfully")
    )
})

export const updateProfileAvatar=asyncHandler(async(req,res)=>{
    const avatarfile=req.file;

    if(!avatarfile){
        throw new ApiError(400,"New profile avatar image is required");
    }
    const avatarLocalPath = req.file?.path;

    const response =await uploadOnCloudinary(avatarLocalPath);

    const previousProfilePath = await User.findById(req.user?._id)


    await deleteFileFromCloudinary(previousProfilePath.avatar.avatarImagePublicId); 
    await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{avatar:{
            avatarImage:response.url,
            avatarImagePublicId:response.public_id
        }}},
    )

    return res.status(200).json(
        new ApiResponse(200,{},"Profile avatar updated successfully")
    )
    
    
})

export const updateProfileCoverImage=asyncHandler(async(req,res)=>{
    const coverImagefile=req.file;

    if(!coverImagefile){
        throw new ApiError(400,"New profile avatar image is required");
    }
    const coverImagefileLocalPath = req.file?.path;
    const response =await uploadOnCloudinary(coverImagefileLocalPath);
    
    const previousProfilePath = await User.findById(req.user?._id)

    await deleteFileFromCloudinary(previousProfilePath.coverImage.coverImagePublicId)

    await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{coverImage:{
            coverImage:response.url,
            coverImagePublicId:response.public_id
        }}},
    )

    return res.status(200).json(
        new ApiResponse(200,{},"Profile coverImage updated successfully")
    )
    
    
})

export const getUserDetails=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{user:req.user},"Done!")
    )
})

export const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const username = req.params;
    if(!username){
        throw new ApiError(404,"User name is not found!");
    }

    const userChannelProfile=await User.aggregate([
            {
                $match:{
                    username:username
                }
            },
            {
                $lookup:{
                    from:"subscribers",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"subscribers",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscribers"
                    },
                    channelsSubscribedTo:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            },
            {
                $project:{
                    fullname:1,
                    avatar:1,
                    coverImage:1,
                    username:1,
                    subscribersCount:1,
                    channelsSubscribedTo:1,
                    isSubscribed:1,
                    email:1
                }
            }
    ]);

    if(!userChannelProfile.length){
        throw new ApiError(400,"channel does not exist");
    }


    return res.status(200).json(
        new ApiResponse(200,{userChannelProfile},"fetched user channel details")
    )
})
