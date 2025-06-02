import { User } from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { cloudinaryUploadHandler } from "../utils/cloudinaryUpload.js";


const userRegisterHanlder = asyncHanlder(async (req,res,next) => {
   
    const {fullName, userName, email, password} = req.body;
    if([fullName,userName, email,password].some((item)=>item?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    };

    const existedUser = User.findOne({
        $or: [{userName},{email}]
    });
    if(existedUser){
        throw new ApiError(409, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");

    }

    const avatar = cloudinaryUploadHandler(avatarLocalPath);
    const coverImage = cloudinaryUploadHandler(coverImageLocalPath);


    if(!avatar.url){
        throw new ApiError(400, "Avatar is required");

    }
    const createdUser = await User.create({
    fullName,
    email,
    userName: userName?.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url ||""
    }) 

    const user = await User.findById(createdUser._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(201,"User created successfully",user))


})


export {userRegisterHanlder}