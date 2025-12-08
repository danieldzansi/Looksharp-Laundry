import { db } from "../db/index.js";
import { customers, plans, subscriptions } from "../models/model.js";
import { eq } from "drizzle-orm";

export const getAllSubscriptions = async (req, res) => {
  try {
    const allSubs = await db.select().from(subscriptions);
    res.status(200).json({ success: true, data: allSubs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getActiveSubscription = async (req, res) => {
  try {
    const activeSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    res.status(200).json({ success: true, data: activeSubs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.status(200).json({ success: true, data: allCustomers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const allPlans = await db.select().from(plans);
    res.status(200).json({ success: true, data: allPlans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
