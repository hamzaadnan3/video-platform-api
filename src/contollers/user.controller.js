import { User } from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { cloudinaryUploadHandler } from "../utils/cloudinaryUpload.js";
import jwt from "jsonwebtoken"
const generateAccessAndResfreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);

       const accessToken =  user.generateAccessToken()
       const refreshToken =  user.generateRefreshToken()

       user.refreshToken = refreshToken;
       user.save({validateBeforeSave: false});

       return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access or refresh token")
    }
}


const userRegisterHanlder = asyncHanlder(async (req,res,next) => {
   
    const {fullName, userName, email, password} = req.body;
    if([fullName,userName, email,password].some((item)=>item?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    };

    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    });
    if(existedUser){
        throw new ApiError(409, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(res.files.coverImage) && res.files.coverImage?.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");

    }

    const avatar = await cloudinaryUploadHandler(avatarLocalPath);
    const coverImage = await cloudinaryUploadHandler(coverImageLocalPath);


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

const userLoginHandler = asyncHanlder(async (req,res,next)=>{

    const {email, password} = req.body;
     if(!email || password){
        throw new ApiError(400, "Email and password is required")
     }

     const user = User.findOne({email});
     if(!user){
        throw new ApiError(400, "User does not exist")

     }


     const isPasswordValid = await user.isPasswordCorrect(password);

     if(!isPasswordValid){
        throw new ApiError(400, "Email or password is incorrect")

     }


    const {accessToken,refreshToken} =  await generateAccessAndResfreshToken();


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,{
            user: loggedInUser, accessToken,refreshToken
        },"User logged In Successfully")
    )



})


const userLogoutHandler = asyncHanlder(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

     const option = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,"User logout successfull",{}))
})


const refreshAccessTokenHandler = asyncHanlder(async (req,res,next) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if(!decodedToken){
        throw new ApiError(401, "Unauthorized")
    }


    const user = User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401, "Unauthorized")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Invalid refresh token")
    }

    const {accessToken,newRefreshToken} = await generateAccessAndResfreshToken(user?._id);

    
     const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newRefreshToken,option)
    .json(
        new ApiResponse(200,{
           accessToken,refreshToken:newRefreshToken
        },"Access Token Refreshed")
    )

})


const updateUserPassword = asyncHanlder(async (req,res,next) => {
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(401, "Unauthorized");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200,"Password updated successfully",{}))

})

const getUser = asyncHanlder(async(req,res,next)=>{
    return res.status(200).json(new ApiResponse(200,"Success",req.user))
})


const updateUserDetails = asyncHanlder(async(req,res,next)=>{
    const {fullName, email} = req.body;
     if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    )
    .select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200,"User updated successfully",user))
})


const updateUserAvatar = asyncHanlder(async (req,res,next) => {
    const avatarLocalPath = req.file.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "User avatar is not uploaded")
    }
    const avatar = cloudinaryUploadHandler(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "User avatar uploaded failed")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar: avatar?.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,"Avatar updated successfully",user))

})



const updateUserCoverImage = asyncHanlder(async (req,res,next) => {
    const coverImageLocalPath = req.file.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "User Cover Image is not uploaded")
    }
    const coverImage = cloudinaryUploadHandler(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(400, "User Cover Image uploaded failed")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage: coverImage?.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,"Cover Image updated successfully",user))

})


export {userRegisterHanlder,userLoginHandler,userLogoutHandler,refreshAccessTokenHandler,updateUserPassword,getUser,updateUserDetails,updateUserAvatar,updateUserCoverImage}