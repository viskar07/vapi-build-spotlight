import { onGetStripeClientSecret } from '@/actions/stripe'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User } from '@prisma/client'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
    user: User
}

const SubscriptionModal = (props: Props) => {
    const router = useRouter()
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false);

    const handleConfirmForm = async () => {
        try {
            setLoading(true)
            if (!stripe || !elements) {
                return toast.error('Stripe is not initialized')
            }

            const intent = await onGetStripeClientSecret(props.user.email, props.user.id);
            if (!intent.secret) {
                return toast.error('Faild to create intent')
            }

            const cardElement = elements.getElement('card');
            if (!cardElement) {
                return toast.error('Card element is not found')
            }
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                intent.secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: props.user.name,
                            email: props.user.email,
                        },
                    },
                }
            )

            if (error) {
                toast.error(error.message)
            }

            if (paymentIntent?.status === 'succeeded') {
                toast.success('Payment successful')
                router.refresh()
            }


        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false);
        }
    }

    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className='rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border 
          bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20'>
                    <PlusIcon />
                    Create Webinar
                </button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Subscription</DialogTitle>
                </DialogHeader>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#B4B0AE',
                                '::placeholder': {
                                    color: '#B4B0AE',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
                <DialogFooter className='gap-4 items-center'>
                    <DialogClose
                        className='w-full sm:w-auto border border-border rounded-md px-3 py-2'
                        disabled={loading}
                    >
                        Cancel
                    </DialogClose>
                    <Button
                        type='submit'
                        className='w-full sm:w-auto '
                        onClick={handleConfirmForm}
                        disabled={loading}
                    >
                        {loading ?
                            (
                                <Loader2Icon className='w-4 h-4 animate-spin' />
                            ) : (' Confirm')

                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SubscriptionModal