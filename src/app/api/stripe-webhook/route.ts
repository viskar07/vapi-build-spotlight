// app/api/stripe/webhook/route.ts
import { changeAttendeeType } from "@/actions/attendance";
import { updateSubscription } from "@/actions/stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripeEvent = async (
  body: string,
  signature: string | null
): Promise<Stripe.Event> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!webhookSecret || !signature) {
    throw new Error("Missing Stripe webhook secret or signature");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
};

export async function POST(req: NextRequest) {
  console.log("📩 Received Stripe Webhook");
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") ?? "";

  try {
    const stripeEvent = await getStripeEvent(body, signature);
    console.log(`📦 Event Type: ${stripeEvent.type}`);

    const eventData = stripeEvent.data.object as { metadata?: Record<string, string> };
    const metadata = eventData.metadata ?? {};

    // ✅ Handle connected account event: skip unless we need to change attendee type
    if (metadata.connectAccountPayments || metadata.connectAccountSubscriptions) {
      console.log("🔁 Skipping connected account event");

      if (stripeEvent.type === "checkout.session.completed" && metadata.attendeeId && metadata.webinarId) {
        await changeAttendeeType(metadata.attendeeId, metadata.webinarId, "CONVERTED");
        console.log("✅ Attendee status updated (Connected Account)");
      }

      return NextResponse.json({ message: "Connected account event processed", success: true, status: 200 });
    }

    // ✅ Handle main Stripe webhook event types
    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        console.log(`🔄 Updating subscription for userId: ${subscription.metadata.userId}`);
        await updateSubscription(subscription);
        return NextResponse.json({ message: "Subscription updated", success: true });
      }

      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const { attendeeId, webinarId } = session.metadata ?? {};

        if (attendeeId && webinarId) {
          await changeAttendeeType(attendeeId, webinarId, "CONVERTED");
          console.log("✅ Attendee status updated (Main Account)");
        }

        return NextResponse.json({ message: "Checkout completed", success: true });
      }

      case "invoice.paid": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        console.log(`💰 Invoice paid for customer: ${invoice.customer_email}`);
        // You can handle invoice logic here
        return NextResponse.json({ message: "Invoice paid", success: true });
      }

      default:
        console.log(`🔎 Unhandled event type: ${stripeEvent.type}`);
        return NextResponse.json({ message: `Acknowledged event: ${stripeEvent.type}`, success: true });
    }
  } catch (error) {
    console.error("❌ Stripe Webhook Error:", error);
    return NextResponse.json({
      message: "Webhook Error",
      error: (error as Error).message,
      success: false,
      status: 400,
    });
  }
}
