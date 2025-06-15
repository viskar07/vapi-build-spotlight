import { onAuthenticatedUser, } from '@/actions/auth'
import { getStripeOauthLink } from '@/lib/stripe/utils'
import { LucideAlertCircle, LucideArrowRight, LucideCheckCircle2, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'


const page = async () => {

    const userExist = await onAuthenticatedUser();
    if (!userExist.user) {
        redirect("/sign-in")
    }
    

    const stripeLink = getStripeOauthLink(
        "api/stripe-connect",
        userExist.user?.id,
    );
    const isConnected = userExist?.user?.stripeConnectId;
    

    return (
        <div className='w-full mx-auto py-8 px-4'   >
            <h1 className="text-2xl font-bold mb-6">
                Payment Integration
            </h1>
            <div className="w-full p-6 border border-input rounded-lg bg-background shadow-sm">
                <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-4 ">
                        <StarIcon className="text-white " fill='#fff' />
                    </div>
                    <div className="">
                        <h2 className="text-xl font-semibold text-primary">
                            Stripe Connect
                        </h2>
                        <p className='text-muted-foreground text-sm'>
                            Connect your Stripe account to start accepting payments.
                        </p>
                    </div>
                </div>

                <div className="my-6 p-4 bg-muted rounded-md">
                    <div className="flex items-start ">
                        {isConnected ? (
                            <LucideCheckCircle2 className='h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0' />
                        ) : (
                            <LucideAlertCircle className='h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink' />
                        )}

                        <div className="">
                            <p className='font-medium'  >
                                {isConnected
                                    ? 'Your Stripe account is connected.'
                                    : 'Connect your Stripe account to start accepting payments.'}
                            </p>
                            <p className='text-sm text-muted-foreground mt-1 '>
                                {isConnected
                                    ? 'You can accept payments through your application.'
                                    : ' connect your Stripe account to start processing paymets and managing subscriptions.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 ">
                    <div className="text-sm text-muted-foreground">
                        {isConnected
                            ? 'You can reconnect anytime if needed.'
                            : "You'll be redirect to Stripe to complete the connection."
                        }
                    </div>
                    {/* TODO : add the stripe */}
                    <Link
                        href={stripeLink}
                        className={`px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors
                            ${isConnected ? 'bg-muted hover:bg-muted/80 text-foreground' : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'}`}
                    >
                        {isConnected ? 'Reconnect' : 'Connect with Stripe'}
                        <LucideArrowRight className='h-4 w-4' />
                    </Link>
                </div>


                {!isConnected && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <h3 className='text-sm font-medium mb-2 '>
                            Why connect with Stripe?
                        </h3>

                        <ul className=" text-sm text-muted-foreground space-y-2">
                            <li className='flex items-center gap-2'>
                                <div className="h-4 w-4 rounded-full bg-green-100 flex justify-center items-center">
                                    <div className="h-1.5 w-1.5 bg-green-500" />

                                </div>
                                Accept payments through your application.
                            </li>
                            <li className='flex items-center gap-2'>
                                <div className="h-4 w-4 rounded-full bg-green-100 flex justify-center items-center">
                                    <div className="h-1.5 w-1.5 bg-green-500" />

                                </div>
                                Manage subscriptions and billing.
                            </li>
                            <li className='flex items-center gap-2'>
                                <div className="h-4 w-4 rounded-full bg-green-100 flex justify-center items-center">
                                    <div className="h-1.5 w-1.5 bg-green-500" />

                                </div>
                                Receive payment notifications.
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default page