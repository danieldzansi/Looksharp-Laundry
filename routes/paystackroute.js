import express from "express";

import { initializePayment,verifyPayment,paystackWebhook } from "../controllers/paystackcontroller.js";

const router=express.Router()

router.post("/initialize",initializePayment)
router.post("/webhook",express.json({type: "*/*"}),paystackWebhook)
router.get("/verify",verifyPayment)


export default router;