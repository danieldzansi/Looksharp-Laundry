import { eq } from "drizzle-orm";
import { paystack } from "../config/paystack.js";
import {
  customers,
  plans,
  subscriptions,
  payments,
  pickups,
} from "../models/model.js";

function generatePickupDates(startDate, pickupsPerMonth, frequency, pickupDay) {
  const dates = [];
  let current = new Date(startDate);

  for (let i = 0; i < pickupsPerMonth; i++) {
    if (frequency === "weekly") {
      if (pickupDay) {
        const dayIndex = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(pickupDay);
        const diff = (dayIndex + 7 - current.getDay()) % 7;
        current.setDate(current.getDate() + diff);
      }
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    } else if (frequency === "biweekly") {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 14);
    } else if (frequency === "monthly") {
      dates.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    } else {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  }

  return dates;
}

export const initializePayment = async (req, res) => {
  try {
    const {
      planId,
      firstName,
      lastName,
      email,
      address,
      phone,
      pickupDay,
      pickupTimeSlot,
      pickupFrequency,
    } = req.body;

    if (!email || !planId || !firstName || !lastName || !phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "missing fields" });
    }

    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    if (!plan.length)
      return res.status(400).json({ message: "plan not found" });

    const price = plan[0].price;
    if (!price)
      return res.status(400).json({ message: "plan requires custom quote" });

    let customer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);
    if (!customer.length) {
      const inserted = await db
        .insert(customers)
        .values({ firstName, lastName, email, phone, address })
        .returning();
      customer = inserted;
    }

    const paystackData = await paystack.post("/transaction/initialize", {
      email,
      amount: Number(price) * 100,
      metadata: {
        planId,
        customerId: customer[0].id,
        pickupDay,
        pickupTimeSlot,
        pickupFrequency,
      },
    });

    res.json({ success: true, data: paystackData.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const reference = req.query.reference || req.query.trxref;
    if (!reference)
      return res.status(400).json({ message: "Missing transaction reference" });

    const data = await paystack.get(`/transaction/verify/${reference}`);
    if (data.status !== "success")
      return res.status(400).json({ message: "Payment not successful" });

    const transaction = data.data;
    const { customerId, planId, pickupDay, pickupTimeSlot, pickupFrequency } =
      transaction.metadata;
    const amount = transaction.amount;

    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    if (!plan.length)
      return res.status(404).json({ message: "plan not found" });

    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.customerId, customerId))
      .limit(1);

    if (!existingSub.length) {
      const startDate = new Date();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const newSub = await db
        .insert(subscriptions)
        .values({
          customerId,
          planId,
          amountPaid: amount / 100,
          status: "active",
          startDate,
          nextBillingDate,
          pickupsRemaining: plan[0].pickupsPerMonth || 4,
          pickupDay,
          pickupTimeSlot,
          pickupFrequency,
        })
        .returning();

      await db.insert(payments).values({
        customerId,
        subscriptionId: newSub[0].id,
        amount: amount / 100,
        currency: "GHS",
        status: "success",
        paystackReference: reference,
        paystackAuthorizationCode:
          transaction.authorization?.authorization_code,
        transactionDate: new Date(transaction.paid_at),
        metadata: transaction.metadata,
      });

      const pickupDates = generatePickupDates(
        startDate,
        plan[0].pickupsPerMonth,
        pickupFrequency,
        pickupDay
      );
      for (const date of pickupDates) {
        await db.insert(pickups).values({
          subscriptionId: newSub[0].id,
          customerId,
          scheduledDate: date,
          scheduledTimeSlot: pickupTimeSlot,
          status: "scheduled",
          bagsCount: plan[0].bagsPerPickup,
        });
      }
    }

    res.json({
      success: true,
      message: "Payment verified, subscription and pickups created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const paystackWebhook = async (req, res) => {
  const crypto = await import("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"])
    return res.status(400).send("invalid signature");

  const event = req.body;
  if (event.event === "charge.success") {
    const { planId, customerId, pickupDay, pickupTimeSlot, pickupFrequency } =
      event.data.metadata;
    const amountPaid = event.data.amount / 100;

    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    if (!plan.length)
      return res.status(404).json({ message: "plan not found" });

    const startDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const newSub = await db
      .insert(subscriptions)
      .values({
        customerId,
        planId,
        amountPaid,
        status: "active",
        startDate,
        nextBillingDate,
        pickupsRemaining: plan[0].pickupsPerMonth || 4,
        pickupDay,
        pickupTimeSlot,
        pickupFrequency,
      })
      .returning();

    await db.insert(payments).values({
      customerId,
      subscriptionId: newSub[0].id,
      amount: amountPaid,
      currency: "GHS",
      status: "success",
      paystackReference: event.data.reference,
    });

    const pickupDates = generatePickupDates(
      startDate,
      plan[0].pickupsPerMonth,
      pickupFrequency,
      pickupDay
    );
    for (const date of pickupDates) {
      await db.insert(pickups).values({
        subscriptionId: newSub[0].id,
        customerId,
        scheduledDate: date,
        scheduledTimeSlot: pickupTimeSlot,
        status: "scheduled",
        bagsCount: plan[0].bagsPerPickup,
      });
    }

    res.sendStatus(200);
  }
};
