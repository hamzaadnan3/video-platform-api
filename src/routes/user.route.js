import { Router } from "express";
import { userRegisterHanlder } from "../contollers/user.controller.js";

const router = Router();

router.route("/register").post(userRegisterHanlder)


export default router;