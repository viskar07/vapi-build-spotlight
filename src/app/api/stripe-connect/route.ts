import { prismaClient } from "@/lib/prismaClient";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    try{
        const searchParams = request.nextUrl.searchParams;
        const params = new URLSearchParams(searchParams);
        const code = params.get("code") 
        const state = params.get("state")

        if(!code || !state){
            console.log("Missing Required Parameters",{code ,state} );
            return NextResponse.redirect(
                new URL(
                    "/settings?success=false&message=Missing Required Parameters",
                    request.url)
            )
            
        }

        try{
            const response = await stripe.oauth.token({
                grant_type: "authorization_code",
                code,
            })
            if(!response.stripe_user_id){
                throw new Error("Missing Stripe User ID")
            }

            await prismaClient.user.update({
                where: {
                    id: state,
                },
                data: {
                    stripeConnectId: response.stripe_user_id,
                },
            })

            return NextResponse.redirect(
                new URL(
                    "/settings?success=true&message=Connected+to+Stripe",
                    request.url)
            )

        } catch (error){
            console.log("Error Connecting Stripe", error);
            return NextResponse.redirect(
                new URL(
                    "/settings?success=false&message=Error+Connecting+to+Stripe",
                    request.url)
            )
        }


    }
    catch(error){
        console.log("Error Connecting Stripe", error);
    }
}