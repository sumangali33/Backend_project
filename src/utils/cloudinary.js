import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { ApiError } from './apierror.js';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
    

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });
        if(response){
            fs.unlinkSync(localFilePath);
            console.log("file uploaded on cloudinary", response.url);
        }
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}


const deleteFileFromCloudinary = async(imagePublicId)=>{
  try {
    const response = await  cloudinary.uploader.destroy(imagePublicId)
    return response;
  } catch (error) {
    throw new ApiError(400,error.message);
  }
}


export {uploadOnCloudinary,deleteFileFromCloudinary};