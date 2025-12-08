CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"customer_code" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"subscription_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'GHS',
	"payment_method" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"paystack_reference" varchar(255) NOT NULL,
	"paystack_authorization_code" varchar(255),
	"transaction_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "pickups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"customer_id" uuid,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time_slot" varchar(50),
	"status" varchar(20) DEFAULT 'scheduled',
	"bags_count" integer,
	"actual_weight" numeric(5, 2),
	"pickup_notes" text,
	"delivery_date" timestamp,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"pickups_per_month" integer NOT NULL,
	"bags_per_pickup" integer NOT NULL,
	"weight_per_bag" integer,
	"includes_ironing" boolean DEFAULT false,
	"includes_stain_treatment" boolean DEFAULT false,
	"priority_scheduling" boolean DEFAULT false,
	"express_delivery" boolean DEFAULT false,
	"features" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"amount_paid" numeric(10, 2) NOT NULL,
	"start_date" timestamp,
	"next_billing_date" timestamp,
	"end_date" timestamp,
	"pickups_remaining" integer,
	"pickups_used" integer DEFAULT 0,
	"auto_renew" boolean DEFAULT true,
	"paystack_subscription_code" varchar(255),
	"paystack_authorization_code" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "payment_customer_id_idx" ON "payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payment_reference_idx" ON "payments" USING btree ("paystack_reference");--> statement-breakpoint
CREATE INDEX "pickup_subscription_id_idx" ON "pickups" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "pickup_scheduled_date_idx" ON "pickups" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subscription_customer_id_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscriptions" USING btree ("status");