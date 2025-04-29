import express from "express";
import * as StripeController from "../controllers/stripe";
import bodyParser from "body-parser";
import { isAdmin, protect } from "../middleware/checkAuth";


const router=express.Router();

router.post("/webhook",bodyParser.raw({ type: "application/json" }),StripeController.checkStripeWebhook);
router.post("/subscription/:priceId",protect,StripeController.makeSubscription)
router.post("/products/add",protect,isAdmin,StripeController.addProduct)
router.get("/products",protect,StripeController.getProducts)


export default router;