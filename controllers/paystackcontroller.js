import { eq } from "drizzle-orm";
import { paystack } from "../config/paystack.js";
import { db } from "../db/index.js";
import { sendSubscriptionEmails } from "../utils/Email.js";
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
      return res
        .status(400)
        .json({ success: false, message: "plan not found" });

    const price = plan[0].price;
    if (!price || price === "0.00")
      return res
        .status(400)
        .json({ success: false, message: "plan requires custom quote" });

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
      callback_url: `${process.env.BACKEND_URL}/api/paystack/verify`,
      metadata: {
        planId,
        customerId: customer[0].id,
        pickupDay,
        pickupTimeSlot,
        pickupFrequency,
        autoRenew: false,
      },
    });

    res.json({ success: true, data: paystackData.data });
  } catch (error) {
    console.error("Payment initialization error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const reference = req.query.reference || req.query.trxref;

    if (!reference) {
      console.log("No reference provided");
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reason=no_reference`
      );
    }

    const data = await paystack.get(`/transaction/verify/${reference}`);

    if (data.status !== true || data.data?.status !== "success") {
      console.log("Payment not successful:", data);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reference=${reference}&reason=payment_unsuccessful`
      );
    }

    const transaction = data.data;
    const { customerId, planId, pickupDay, pickupTimeSlot, pickupFrequency } =
      transaction.metadata;
    const amount = transaction.amount / 100;
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan.length) {
      console.log("Plan not found:", planId);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reference=${reference}&reason=plan_not_found`
      );
    }

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
          amountPaid: amount,
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
        amount: amount,
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

      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      await sendSubscriptionEmails({
        customerEmail: customer[0].email,
        customerName: `${customer[0].firstName} ${customer[0].lastName}`,
        customerPhone: customer[0].phone,
        customerAddress: customer[0].address,
        planName: plan[0].name,
        planPrice: plan[0].price,
        startDate: startDate,
        nextBillingDate: nextBillingDate,
        pickupsPerMonth: plan[0].pickupsPerMonth,
        bagsPerPickup: plan[0].bagsPerPickup,
        pickupDay: pickupDay,
        pickupTimeSlot: pickupTimeSlot,
        pickupFrequency: pickupFrequency,
        subscriptionId: newSub[0].id,
        features: plan[0].features || [],
        amountPaid: amount,
        paystackReference: reference,
      });

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?reference=${reference}&subscriptionId=${newSub[0].id}`
      );
    } else {
      console.log("Customer already has subscription");
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?reference=${reference}&subscriptionId=${existingSub[0].id}&existing=true`
      );
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    console.error("Error stack:", error.stack);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?error=${encodeURIComponent(
        error.message
      )}`
    );
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
    const metadata = event.data.metadata;
    const { planId, customerId, pickupDay, pickupTimeSlot, pickupFrequency } =
      metadata;

    const amountPaid = event.data.amount / 100;

    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.customerId, customerId))
      .limit(1);

    if (existingSub.length) {
      return res.sendStatus(200); 
    }

    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan.length) return res.sendStatus(200);

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
      transactionDate: new Date(),
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

    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    await sendSubscriptionEmails({
      customerEmail: customer[0].email,
      customerName: `${customer[0].firstName} ${customer[0].lastName}`,
      customerPhone: customer[0].phone,
      customerAddress: customer[0].address,
      planName: plan[0].name,
      planPrice: plan[0].price,
      startDate,
      nextBillingDate,
      pickupsPerMonth: plan[0].pickupsPerMonth,
      bagsPerPickup: plan[0].bagsPerPickup,
      pickupDay,
      pickupTimeSlot,
      pickupFrequency,
      subscriptionId: newSub[0].id,
      features: plan[0].features || [],
      amountPaid,
      paystackReference: event.data.reference,
    });

    return res.sendStatus(200); 
  }

  res.sendStatus(200);
};
