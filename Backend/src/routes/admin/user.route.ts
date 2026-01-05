import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware,adminOnlyMiddleware } from "../../middlewares/authorization.middleware";

let adminUserController = new AdminUserController();
const router = Router();

router.get("/",authorizedMiddleware, adminOnlyMiddleware, adminUserController.getAllUsers);
router.get("/:id", adminUserController.getUserById);
router.put("/:id", adminUserController.updateOneUser);
router.delete("/:id", adminUserController.deleteOneUser);
router.post("/", adminUserController.createUser);

export default router;
