import { getAttendeeById } from '@/actions/attendance';
import { getWebinarById } from '@/actions/webinar';
import { WebinarWithPresenter } from '@/lib/type';
import { WebinarStatusEnum } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react'
import AutoConnectCall from './_components/AutoConnectCall';

type Props = {
    params: Promise<{
        liveWebinarid: string;
    }>
    searchParams: Promise<{
        attendeeId: string;
    }>
}

const page = async ({ params, searchParams }: Props) => {
    const { liveWebinarid } = await params;
    const { attendeeId } = await searchParams;

    if (!liveWebinarid || !attendeeId) {
        redirect('/404')
    }

    const attendee = await getAttendeeById(attendeeId, liveWebinarid);

    if (!attendee.data) {
        redirect(`/live-webinar/${liveWebinarid}?error=attendee_not_found`)
    }

    const webinar = await getWebinarById(liveWebinarid);

    if (!webinar) redirect('/404')

    if(
        webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ||
        webinar.webinarStatus === WebinarStatusEnum.SCHEDULED
    ) {
        redirect(`/live-webinar/${liveWebinarid}?error=webinar_not_started`)
    }

    if(
        webinar.ctaType !== 'BOOK_A_CALL' ||
        !webinar.aiAgentId ||
        !webinar.priceId
    ){
        console.log(webinar.aiAgentId,webinar.priceId,webinar.ctaType);
        
        redirect(`/live-webinar/${liveWebinarid}?error=cannot-book-a-call`)
    }
    
    if(attendee.data?.callStatus === 'COMPLETED' ) {
        redirect(`/live-webinar/${liveWebinarid}?error=call-not-pending`)
    }
    return (
        <AutoConnectCall 
            userName={attendee.data.name}
            webinar={webinar as WebinarWithPresenter}
            userId={attendeeId}
            assistantId={webinar.aiAgentId}
        />
    )
}

export default page