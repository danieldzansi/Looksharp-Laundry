import { eq } from "drizzle-orm";
import { paystack } from "../config/paystack.js";
import { customers, plans, subscriptions, payments } from "../models/model.js";

export const initializePayment = async (req, res) => {
  try {
    const { planId, firstName, lastName, email, address, phone } = req.body;

    if ((!email || !planId || !firstName, !phone, !address, !lastName)) {
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
        .values({
          firstName,
          lastName,
          email,
          phone,
          address,
        })
        .returning();
      customer = inserted;
    }

    const paystackData = await paystack.post("/transaction/initialize", {
      email,
      amount: Number(price) * 100,
      metadata: { planId, customerId: customer[0].id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const reference = req.query.reference || req.query.trxref;
    if (!reference) {
      return res.status(400).json({ message: "Missing transaction reference" });
    }
    const data = await paystack.get(`/transaction/verify/${reference}`);
    if (data.status !== "success") {
      return res.status(400).json({ message: "Payment not succeessful" });
    }

    const transaction = data.data;
    const { email, metadata, amount } = transaction;

    const { customerId, planId } = metadata;

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
        metadata,
      });
    }
    res.json({
      success: true,
      message: "Payment verified and subscription created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const paystackWebhook = async (req, res) => {
  console.log("webhook Payload :", JSON.stringify(req.body, null, 2));

  const crypto = await import("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const signature = req.headers["x-paystack-signature"];
  if (hash !== signature) {
    console.error("invalid webhook signature");
    return res.status(400).send("invalid signature");
  }

  const event = req.body;
  if (event.event === "charge.success") {
    const { planId, customerId } = event.data.metadata;
    const amountPaid = event.data.amount / 100;

    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    const startDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const newSub = await db.insert(subscriptions).values({
      customerId,
      planId,
      amountPaid,
      status: "active",
      startDate: new Date(),
      nextBillingDate: new (new Date().setMonth(new Date().getMonth() + 1))(),
      pickupsRemaining: planId ? 4 : 0,
    });

    await db.insert(payments).values({
      customerId,
      subscriptionId,
      amount: amountPaid,
      currency: "GHS",
      status: "success",
      paystackReference: event.data.reference,
    });
    res.sendStatus(200);
  }
};
