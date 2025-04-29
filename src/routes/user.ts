import express from "express";
import * as userController from "../controllers/user";
import { protect } from "../middleware/checkAuth";

const router=express.Router();

router.get("/all", protect, userController.getUsers);
router.post("/login",userController.login);
router.post("/register",userController.registerUser);
router.post("/logout",protect,userController.logoutUser);
router.post("/embedded",protect,userController.updateEmbeddedSignUp);


export default router;