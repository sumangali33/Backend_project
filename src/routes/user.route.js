import { Router } from "express";
import { registerUser } from "../controllers/users_register.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userLogin,refershAccessToken } from "../controllers/users_login.controller.js";
import {userLogout} from "../controllers/users_logout.controller.js"
import { verifyUserLogin } from "../middlewares/auth.middleware.js";
import { changePassword,changeDetails,updateProfileAvatar,updateProfileCoverImage,getUserDetails,getUserChannelProfile } from "../controllers/users_update.controller.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount : 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),registerUser);


router.route("/login").post(userLogin);

router.route("/logout").post(verifyUserLogin,userLogout);

router.route("/refreshToken").post(refershAccessToken);

router.route("/updatePassword").post(verifyUserLogin,changePassword);

router.route("/updateDetails").post(verifyUserLogin,changeDetails);

router.route("/getUserDetails").get(verifyUserLogin,getUserDetails);

router.route("/updateAvatar").post(verifyUserLogin,upload.single('avatar'),updateProfileAvatar);

router.route("/updateCoverImage").post(verifyUserLogin,updateProfileCoverImage);

router.route("/:username").get(verifyUserLogin,getUserChannelProfile);





export default router;