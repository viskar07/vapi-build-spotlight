import { useStripeElement } from '@/lib/stripe/stirpe-client';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react'

type Props = {
    children?: React.ReactNode;
}

export const StripeElement = (props: Props) => {

    const { StripePromise } = useStripeElement();
    const promise  = StripePromise();

    return <Elements stripe={promise}>{props.children}</Elements>
}
