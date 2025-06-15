import { onAuthenticatedUser } from '@/actions/auth'
import { getWebinarById } from '@/actions/webinar'
import React from 'react'
import RenderWebinar from './_components/RenderWebinar'
import { WebinarWithPresenter } from '@/lib/type'
import { WebinarStatusEnum } from '@prisma/client'

type Props = {
    params: Promise<{
      liveWebinarid : string
    }>
    searchParams: Promise<{
      error : string
    }>
}

const page = async ({params, searchParams}: Props) => {
    const {liveWebinarid} = await params;
    const {error} = await searchParams;

    const webinarData = await getWebinarById(liveWebinarid);
    const recording = {};

    if(webinarData?.webinarStatus === WebinarStatusEnum.ENDED){
        // const recording = await getStreamRecording(liveWebinarid)
    }

    if(!webinarData){
        return <div className='w-full min-h-screen flex items-center justify-center text-lg sm:text-4xl'>Webinar not found</div>
    }

    const apikey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
   

    const checkUser = await onAuthenticatedUser()



    return (
        <div className='w-full min-h-screen mx-auto'>
            <RenderWebinar
                error={error || null}
                user={checkUser.user || null}
                apiKey={apikey}
                webinar={webinarData as WebinarWithPresenter}
                // @ts-ignore
               recording={recording.data || null}
            />
        </div>
    )
}

export default page