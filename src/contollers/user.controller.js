import asyncHanlder from "../utils/asyncHandler.js";


const userRegisterHanlder = asyncHanlder(async (req,res,next) => {
    res.status(200).json({
        message:"OK"
    })
})


export {userRegisterHanlder}