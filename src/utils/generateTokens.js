import {User} from '../models/user.model.js';
import { ApiError } from './apierror.js';


export const generateAcessAndRefreshTokens=async (userId)=>{
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generaterefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(401, "error while generating access token and refresh token")
    }
}