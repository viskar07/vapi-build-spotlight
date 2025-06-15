export const dynamic = 'force-dynamic'
import { getAllAttendeesWithWebinar } from '@/actions/attendance';
import { onAuthenticatedUser } from '@/actions/auth';
import { getAllProductsFromStripe } from '@/actions/stripe';
import { getAllAssistants, listUserVapiCallsIds } from '@/actions/vapi';
import { getAllWebinarIdsAndNames } from '@/actions/webinar';
import Header from '@/components/ReuseableComponents/LayoutsComponents/Header';
import Sidebar from '@/components/ReuseableComponents/LayoutsComponents/Sidebar';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    children: React.ReactNode;
}

const Layout = async (props: Props) => {
    const userExits = await onAuthenticatedUser();

    if (!userExits) {
        redirect("/sign-in")
    }

    const stripeProducts = await getAllProductsFromStripe();
    const assistants = await getAllAssistants()
    const webinarKeys = await getAllWebinarIdsAndNames()
    const phoneNumbers = await listUserVapiCallsIds()
    const allAttendees = await getAllAttendeesWithWebinar()
    

    return (
        <div className='flex w-full min-h-screen'>
            {/*Sidebar  */}
            <Sidebar/>
            <div className="flex flex-col w-full h-screen overflow-auto px-4 scroll-hide container mx-auto">
                {/* Header*/}
                <Header user={userExits.user!} stripeProducts={stripeProducts.products || []}  assistants={assistants.data || []} webinarKeys={webinarKeys.data || []} VapiCallCredential={phoneNumbers.phoneNumbers || []}  attendee={allAttendees.data || []}/>
                <div className="flex-1 py-10">
                {props.children}
                </div>
            </div>
        </div>
    )
}

export default Layout