import { changeAttendeeType } from "@/actions/attendance";
import { updateSubscription } from "@/actions/stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SBUSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
  "invoice.created",
  "invoice.finalized",
  "invoice.paid",
]);

const getStripeEvent = async (
  body: string,
  signature: string | null
): Promise<Stripe.Event> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!webhookSecret || !signature) {
    throw new Error("Webhook Secret is not defined");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
};

export async function POST(req: NextRequest) {
  console.log("Received Webhook Request");
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") ?? "";

  try {
    const stripeEvent = await getStripeEvent(body, signature);

    // Log every event type that is received
    console.log(`Processing webhook event: ${stripeEvent.type}`);

    // Skip events from connected accounts if necessary
    const eventData = stripeEvent.data.object as { metadata?: { [key: string]: {id:string} } };
    const metadata = eventData.metadata;
    if (metadata?.connectAccountPayments || metadata?.connectAccountSubscriptions) {
      console.log("Skipping connected account event");
      if(eventData.metadata && eventData.metadata?.attendeeId) {
        switch (stripeEvent.type) {
          case "checkout.session.completed":
            await changeAttendeeType(eventData.metadata.attendeeId.id ,metadata.webinarId.id,"CONVERTED")
        }
      }
    
      return NextResponse.json({ message: "Skipping connected account event", success: true, status: 200 });
    }
    
  
    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        console.log(`Updating subscription for userId: ${subscription.metadata.userId}`);
        await updateSubscription(subscription);
        return NextResponse.json({ message: "Subscription Updated", success: true, status: 200 });
      }

      case "invoice.paid": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        // Example: Provision access or fulfill an order after successful payment.
        // You can extract the subscription details from the invoice if needed.
        console.log(`Invoice paid for customer: ${invoice.customer_email}`);
        // Add your business logic for paid invoices here.
        return NextResponse.json({ message: "Invoice Paid", success: true, status: 200 });
      }

      // Add cases for other events you want to handle explicitly
      // case "checkout.session.completed":
      //   // ... your logic
      //   break;

      default:
        console.log(`✅ Unhandled but acknowledged event type: ${stripeEvent.type}`);
        // Return a success response for unhandled events to acknowledge receipt to Stripe
        return NextResponse.json({ message: `Acknowledged unhandled event: ${stripeEvent.type}`, success: true, status: 200 });
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({
      message: "Webhook Error",
      error: (error as Error).message,
      success: false,
      status: 400, // Use 400 for client-side errors like a bad signature
    });
  }
}
