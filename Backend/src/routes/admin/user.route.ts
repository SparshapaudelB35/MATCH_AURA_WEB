import { Router } from "express";

import { uploads } from "../../middlewares/upload.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorization.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware

router.post("/", uploads.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploads.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;