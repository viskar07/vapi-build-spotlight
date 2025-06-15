'use client'
import { User, WebinarStatusEnum } from '@prisma/client'
import React, { useEffect } from 'react'
import UpcomingWebinarState from './UpcomingWebinar/UpcomingWebinarState'
import { usePathname, useRouter } from 'next/navigation'
import { useAttendeeStore } from '@/store/useAttendeeStore'
import { toast } from 'sonner'
import LiveStreamState from './LiveWebinarState/LiveStreamState'
import { StreamCallRecording, WebinarWithPresenter } from '@/lib/type'
import Participant from './participants/Participant'

type Props = {
    error: string | null,
    user: User | null,
    apiKey: string,
    webinar: WebinarWithPresenter,
    recording?: StreamCallRecording | null
}

const RenderWebinar = ({ error, apiKey, user, webinar, recording }: Props) => {

    const router = useRouter()
    const pathname = usePathname()
    const { attendee } = useAttendeeStore()

    useEffect(() => {
        if (error) {
            toast.error(error);
            router.push(pathname)

        }
    }, [attendee])


    return (
        <React.Fragment>
            {webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
                <React.Fragment>
                    {user?.id === webinar.presenterId ? (
                        <LiveStreamState
                            apiKey={apiKey}
                            webinar={webinar}
                            user={user}
                            callId={webinar.id}
                        />

                    ) : (
                        attendee ? (
                            <Participant
                                webinar={webinar}
                                apiKey={apiKey}
                                callId={webinar.id}
                            />
                        ) : (
                            <UpcomingWebinarState
                                webinar={webinar}
                                currentUser={user || null}

                            />
                        )
                    )}
                </React.Fragment>
            ) : (
                webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
                    <div className="flex justify-center items-center h-full w-full">
                        <div className="text-center space-y-4">
                            <h3 className='text-2xl font-semobold text-primary'>
                                {webinar.title}
                            </h3>
                            <p className='text-muted-foreground text-xs'>
                                This webinar has been cancelled.
                            </p>
                        </div>
                    </div>
                ) : (webinar.webinarStatus === WebinarStatusEnum.ENDED ? (
                    recording?.url ? (
                        // <video
                        //     className='w-full h-full rounded-lg'
                        //     controls
                        //     src={recording.url}
                        // />
                        'This is video'

                    ) : (
                        <div className="flex justify-center items-center h-full w-full">
                            <div className="text-center space-y-4">
                                <h3 className='text-2xl font-semobold text-primary'>
                                    {webinar.title}
                                </h3>
                                <p className='text-muted-foreground text-xs'>
                                    This webinar has Ended. No recording available.
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    <UpcomingWebinarState
                        webinar={webinar}
                        currentUser={user || null}

                    />
                ))
            )
            }
        </React.Fragment>
    )
}

export default RenderWebinar