'use client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ZapIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import PurpleIcon from '../PurpleIcon'
import { User } from '@prisma/client'
import Stripe from 'stripe'
import { StripeElement } from '../Stripe/Element'
import SubscriptionModal from '../SubscriptionModal'
import { Assistant } from '@vapi-ai/server-sdk/api'
import { AttendeeWithWebinarType, PhoneNumber } from '@/lib/type'
import CreateCallButton from '../createCall'
import CreateWebinarButton from '../CreateWebinarButton'

type Props = {
  user: User,
  stripeProducts: Stripe.Product[] | []
  assistants: Assistant[] | []
  webinarKeys: {id:string,name:string}[] | [] 
  VapiCallCredential: PhoneNumber[] | []
  attendee: AttendeeWithWebinarType[] | []
}

const Header = (props: Props) => {
  const pathname = usePathname()
  const router = useRouter();
  
  return (

    <div className='w-full px-4 pt-10 sticky top-0 z-10 flex justify-between items-center 
                   flex-wrap gap-4 bg-background '>
      {pathname.includes('pipeline') ? (
        <Button
          className='bg-primary/10 border border-border rounded-xl'
          variant={'outline'}
          onClick={() => router.push('/webinars')}
        >
          <ArrowLeft /> Back To Webinar
        </Button>
      ) : (
        <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize ">
          {pathname.split('/')[1]}
        </div>
      )}

      

     

      <div className="flex gap-6 items-center flex-wrap">
      {
        
        props.user.subscription ? (

          !pathname.includes('calls') ? (
          <CreateWebinarButton stripeProducts={props.stripeProducts}  assistants={props.assistants}/>

          ) :(<CreateCallButton 
            assistants={props.assistants} 
            VapiCallCredential={props.VapiCallCredential} 
            attendee={props.attendee} 
            webinarKeys={props.webinarKeys} />)
          
        ) : (
          <StripeElement>
            <SubscriptionModal user={props.user} />
          </StripeElement>
        )
      }

      
        <PurpleIcon>
          <ZapIcon />
        </PurpleIcon>
        

      </div>

    </div>
  )
}

export default Header