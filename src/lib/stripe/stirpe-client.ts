import { loadStripe } from "@stripe/stripe-js";
export const useStripeElement = (connectedAccountId?: string) => {
  if (connectedAccountId) {
    const StripePromise = async () =>
      await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
        stripeAccount: connectedAccountId,
      });
    return { StripePromise };
  } else {
    const StripePromise = async () =>
      await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! ?? '');
    return { StripePromise };
  }
};
