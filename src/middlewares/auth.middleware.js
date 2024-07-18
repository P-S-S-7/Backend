import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";



export const verifyJWT = asyncHandler(async (req, _ , next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "Unauthorized access");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw next(new ApiError(401, error?.message || "Invalid access token"));
    }
})


// since res is not used in this middleware, we can use _ to indicate that we are not using it (Production)