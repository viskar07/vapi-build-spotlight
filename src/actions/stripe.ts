"use server";

import { stripe } from "@/lib/stripe";
import { onAuthenticatedUser } from "./auth";
import Stripe from "stripe";
import { prismaClient } from "@/lib/prismaClient";
import { changeAttendeeType } from "./attendance";

export const getAllProductsFromStripe = async () => {
  try {
    const currentUser = await onAuthenticatedUser();
    if (!currentUser) {
      return {
        error: "User not found",
        status: 401,
      };
    }

    if (!currentUser.user?.stripeCustomerId) {
      return {
        error: "User not Connected with Stripe",
        status: 401,
      };
    }

    const products = await stripe.products.list(
      {},
      {
        stripeAccount: currentUser.user?.stripeCustomerId,
      }
    );

    return {
      products: products.data,
      status: 200,
    };
  } catch (error) {
    return {
      error: `Something went wrong ${error}`,
      status: 500,
    };
  }
};


export const onGetStripeClientSecret = async (email: string, userId: string) => {
    try{
        let customer:Stripe.Customer 
        const existingCustomers = await stripe.customers.list({
            email: email,
        })
        if(existingCustomers.data.length > 0){
            customer = existingCustomers.data[0]
        }else{
            customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId
                }
            }
        )
        }
        await prismaClient.user.update({
            where: {
                id: userId
            },
            data: {
                stripeCustomerId: customer.id
            }
        })

        const subScription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID! as string,
            }],
            expand: ['latest_invoice.payment_intent'],
            payment_behavior: 'default_incomplete',
            metadata: {userId: userId},
            
        });

        const paymentIntent = (subScription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent

        return {
            status: 200,
            secret: paymentIntent.client_secret,
            customerId: customer.id,
        }
    }catch(error){
        console.log(error)
        return {
            status: 500,
            message: 'Failed to create Subscription',
        }
    }
}


export const updateSubscription = async (subscription: Stripe.Subscription,) => {
    try{
      const userId = subscription.metadata.userId;
      if(!userId){
        throw new Error("Missing User ID")
      }
      console.log(subscription.status);
      

      await prismaClient.user.update({
        where: {
          id: userId
        },
        data :{
            subscription: subscription.status === 'active' ? true : false,
        }
      })
      
    }catch(error){
      console.log(error)
    }
}


export const createCheckoutLink = async (
  priceId:string,
  stripeId: string,
  attendeeId: string,
  webinarId: string,
  bookCall: boolean=false,
) => {
  try{
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        webinarId: webinarId,
        attendeeId: attendeeId,
      },
    },
    { 
      stripeAccount: stripeId,
    }
  )

  if(bookCall){
    await changeAttendeeType(attendeeId,webinarId, 'ADDED_TO_CART');

  }

  return {
    status: 200,
    sessionUrl: session.url,
    success:true
  }
  }catch(error){
    console.log(error)
    return {
      status: 500,
      success: false,
    }
  }
}