import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,    // it puts an index on the username field which will make the search faster
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },  
        avatar: {
            type: String, // cloudinary url - aws s3 url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url - aws s3 url
        },
        watchHistory : [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    }, 
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function(next) { // mongoose middleware
    if (!this.isModified("password")) {
        return next();  
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.isPasswordCorrect = async function(password) { // monngoose custom method
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() { // monngoose custom method
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_DURATION,
        }
    )
}
userSchema.methods.generateRefreshToken = function() { // monngoose custom method
     return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn: process.env.REFRESH_TOKEN_DURATION,
        }
    )
}

export const User =  mongoose.model("User", userSchema);