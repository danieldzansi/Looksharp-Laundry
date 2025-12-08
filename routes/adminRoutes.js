import express from 'express';
import { getActiveSubscription, getAllSubscriptions, getAllCustomers, getAllPlans } from '../controllers/adminController.js';

const router = express.Router();

router.get("/subscription", getAllSubscriptions);
router.get("/active/subscription", getActiveSubscription);
router.get("/customer", getAllCustomers);
router.get("/plans", getAllPlans);

export default router;
