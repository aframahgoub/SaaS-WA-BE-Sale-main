import express from "express";
import * as WebhookController from "../controllers/webhook";


const router=express.Router();

router.get("/check", WebhookController.checkWebhook);
router.get("/", WebhookController.vertifyWebhook);
router.post("/", WebhookController.listenWebhook);

export default router;