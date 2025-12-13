import {
  pgTable,
  text,
  varchar,
  uuid,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    pickupsPerMonth: integer("pickups_per_month").notNull(),
    bagsPerPickup: integer("bags_per_pickup").notNull(),
    weightPerBag: integer("weight_per_bag"),
    includesIroning: boolean("includes_ironing").default(false),
    includesStainTreatment: boolean("includes_stain_treatment").default(false),
    priorityScheduling: boolean("priority_scheduling").default(false),
    expressDelivery: boolean("express_delivery").default(false),
    isPreferred:boolean("is_preferred").default(false),
    displayOrder: integer("display_order").notNull(),
    features: jsonb("features"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
  })
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }).notNull(),
    address: text("address").notNull(),
    customerCode: varchar("customer_code", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    planId: uuid("plan_id")
      .references(() => plans.id)
      .notNull(),
    status: varchar("status", { length: 20 }).default("pending"),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    startDate: timestamp("start_date"),
    nextBillingDate: timestamp("next_billing_date"),
    endDate: timestamp("end_date"),
    pickupDay: varchar("pickup_day"),
    pickupTimeSlot: varchar("pickup_time_slot"),
    pickupFrequency: varchar("pickup_frequency"),
    pickupsRemaining: integer("pickups_remaining"),
    pickupsUsed: integer("pickups_used").default(0),
    autoRenew: boolean("auto_renew").default(true),
    paystackSubscriptionCode: varchar("paystack_subscription_code", {
      length: 255,
    }),
    paystackAuthorizationCode: varchar("paystack_authorization_code", {
      length: 255,
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("subscription_customer_id_idx").on(table.customerId),
    statusIdx: index("subscription_status_idx").on(table.status),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("GHS"),
    paymentMethod: varchar("payment_method", { length: 50 }),
    status: varchar("status", { length: 20 }).default("pending"),
    paystackReference: varchar("paystack_reference", { length: 255 })
      .notNull()
      .unique(),
    paystackAuthorizationCode: varchar("paystack_authorization_code", {
      length: 255,
    }),
    transactionDate: timestamp("transaction_date"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("payment_customer_id_idx").on(table.customerId),
    referenceIdx: index("payment_reference_idx").on(table.paystackReference),
  })
);

export const pickups = pgTable(
  "pickups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
    customerId: uuid("customer_id").references(() => customers.id),
    scheduledDate: timestamp("scheduled_date").notNull(),
    scheduledTimeSlot: varchar("scheduled_time_slot", { length: 50 }),
    status: varchar("status", { length: 20 }).default("scheduled"),
    bagsCount: integer("bags_count"),
    actualWeight: decimal("actual_weight", { precision: 5, scale: 2 }),
    pickupNotes: text("pickup_notes"),
    deliveryDate: timestamp("delivery_date"),
    rating: integer("rating"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    subscriptionIdIdx: index("pickup_subscription_id_idx").on(
      table.subscriptionId
    ),
    scheduledDateIdx: index("pickup_scheduled_date_idx").on(
      table.scheduledDate
    ),
  })
);
