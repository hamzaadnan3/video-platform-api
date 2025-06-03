import { User } from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { cloudinaryUploadHandler } from "../utils/cloudinaryUpload.js";

const generateAccessAndResfreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);

       const accessToken =  user.generateAccessToken()
       const refreshToken =  user.generateRefreshToken()

       user.refreshToken = refreshToken;
       user.save({validateBeforeSave: false});

       return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating access or refresh token")
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


export {userRegisterHanlder}