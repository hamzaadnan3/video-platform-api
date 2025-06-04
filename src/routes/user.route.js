import { Router } from "express";
import { refreshAccessTokenHandler, userLoginHandler, userLogoutHandler, userRegisterHanlder } from "../contollers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
         {
            name:"coverImage",
            maxCount: 1
        }
    ])
    ,userRegisterHanlder)

router.route("/login").post(userLoginHandler)

//protected routes
router.route("/logout").post(verifyJWT, userLogoutHandler)
router.route("/refresh-token").post(refreshAccessTokenHandler)


export default router;