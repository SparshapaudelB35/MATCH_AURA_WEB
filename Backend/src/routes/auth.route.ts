import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)

router.get("/whoami", authorizedMiddleware, authController.getProfile);
router.get("/discover", authorizedMiddleware, authController.getDiscoverUsers);
router.get("/matches", authorizedMiddleware, authController.getMatches);
router.get("/messages/:userId", authorizedMiddleware, authController.getMessages);
router.post("/messages/:userId", authorizedMiddleware, authController.sendMessage);
router.post("/swipe", authorizedMiddleware, authController.swipeUser);

router.put(
    "/update-profile",
    authorizedMiddleware,
    uploads.fields([
        { name: "image", maxCount: 1 },
        { name: "profileImages", maxCount: 6 },
    ]),
    authController.updateProfile
)

export default router;
