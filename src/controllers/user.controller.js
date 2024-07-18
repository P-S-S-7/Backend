import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/FileUploadCloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);   
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while Access and Refresh Token generation")
    }
}


// Register a new user
const registerUser = asyncHandler(async (req, res) => {
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

    const {fullName, email, username, password} = req.body;

    if([fullName, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Please provide all the required fields");
    }

    const existingUser = await User.findOne({$or: [{email}, {username}]}); // why await - because it is an async operation

    if(existingUser){
        throw new ApiError(409, "User with this email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

// login a user
const loginUser = asyncHandler(async (req, res) => {
    // code to login a user
    // steps
    // 1. get the user data from the request body (data that is sent from the client to the server - frontend)
    // 2. validate the user data - not empty, valid email, password length, etc.
    // 3. check if the user exists in the database - using email or username
    // 4. check if the password is correct
    // 5. generate an access token and refresh token
    // 6. send cookies with the tokens
    // 7. send a response

    const {email, username, password} = req.body;

    if(!email && !username){
        throw new ApiError(400, "Please provide email or username");
    }

    if(!password){
        throw new ApiError(400, "Please provide password");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, refreshToken,
                message: "User logged in successfully"
            })
        )
})

// logout a user
const logoutUser = asyncHandler(async (req, res) => {
    // code to logout a user
    // 1. clear refresh token from the database
    // 2. clear the cookies
    // 3. send a response

    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})


export {registerUser, loginUser, logoutUser};