import express from "express";
import * as MediaController from "../controllers/media";
import { protect } from "../middleware/checkAuth";

const router=express.Router();

router.post("/",protect,MediaController.upload.single('file'), MediaController.uploadFile);
// router.get("/:mediaID", MediaController.mediaDownload);
// router.delete("/:mediaID", MediaController.mediaDelete);
// router.get("/",MediaController.check);


export default router;