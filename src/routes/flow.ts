import express from "express";
import * as FlowController from "../controllers/flow";

const router=express.Router();


router.post("/", FlowController.sendFlows);
router.get("/", FlowController.getFlows);

export default router;