import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/FileUploadCloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res, next) => {
    // code to register a user
    // steps
    // 1. get the user data from the request body (data that is sent from the client to the server - frontend)
    // 2. validate the user data - not empty, valid email, password length, etc.
    // 3. check if the user already exists in the database - using email or username
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, check for avatar
    // 6. create user object - a new entry in the database
    // 7. remove password and reset token field from response
    // 8. check for user creation
    // 9. send a response

    const {fullname, email, username, password} = req.body;

    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Please provide all the required fields");
    }
    console.log(fullname, email, username, password);

    const existingUser = await User.findOne({$or: [{email}, {username}]}); // why await - because it is an async operation

    if(existingUser){
        throw new ApiError(409, "User with this email or username already exists");
    }
    console.log(existingUser);

    const  avatarLocalImage = req.files?.avatar[0]?.path; // path of the uploaded file
    console.log(avatarLocalImage);

    const coverImageLocalImage = req.files?.background[0]?.path; // path of the uploaded file
    console.log(coverImageLocalImage);

    if(!avatarLocalImage){
        throw new ApiError(400, "Please provide an avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalImage);
    console.log(avatar);

    const coverImage = await uploadOnCloudinary(coverImageLocalImage);
    console.log(coverImage);

    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "User creation failed");
    }

    return res.Status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    );
})

export {registerUser}