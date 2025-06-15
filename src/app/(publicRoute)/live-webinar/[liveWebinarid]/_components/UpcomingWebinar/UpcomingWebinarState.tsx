'use client'
import { User, Webinar, WebinarStatusEnum } from '@prisma/client'
import React, { useState } from 'react'
import CountDownTimer from './CountDownTimer'
import Image from 'next/image'
import WaitListComponent from './WaitListComponent'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { changeWebinarStatus } from '@/actions/webinar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createAndStartStream } from '@/actions/stream'

type Props = {
    webinar: Webinar
    currentUser: User | null
}

const UpcomingWebinarState = ({ webinar, currentUser }: Props) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const handleStartWebinar = async () => {
        setLoading(true)
        try {
            if (!currentUser?.id) {
                throw new Error('Unauthorized')
            }

            await createAndStartStream(webinar)

            const res = await changeWebinarStatus(webinar.id, WebinarStatusEnum.LIVE)

            if (res.status === 500) {
                throw new Error(res.message)
            }

            toast.success('Webinar has started')
            router.refresh()
        }
        catch (error) {
            console.log(error)
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className='w-full min-h-screen mx-auto max-w-[400px] flex flex-col justify-center items-center gap-8 py-20'>
            <div className="space-y-6">
                <p className='text-3xl font-semibold text-primary text-center'>Seems Like you are little early</p>
                <CountDownTimer
                    webinarId={webinar.id}
                    className='text-center'
                    targetDate={webinar.startTime}
                    webinarStatus={webinar.webinarStatus}

                />
            </div>
            <div className="space-y-6 w-full h-full flex justify-center items-center flex-col">
                <div className="w-full max-w-md aspect-[4/3] relative rounded-4xl overflow-hidden mb-6">
                    <Image
                        src={webinar.thumbnail||'/darkthumbnail.png'}
                        fill
                        alt={webinar.title}
                        priority
                        className='object-cover'
                    />
                </div>

                {webinar.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
                    <WaitListComponent
                        webinarId={webinar.id}
                        webinarStatus='SCHEDULED'
                    />
                ) : (
                    webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
                        <>
                            {currentUser?.id === webinar.presenterId ? (
                                <Button
                                    className='w-full max-w-[300px] font-semibold'
                                    onClick={handleStartWebinar}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Starting...
                                        </>
                                    ) : (
                                        'Start Webinar'
                                    )}
                                </Button>
                            ) : (
                                <WaitListComponent
                                    webinarId={webinar.id}
                                    webinarStatus='WAITING_ROOM'
                                />
                            )}
                        </>
                    ) : webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
                        <WaitListComponent
                            webinarId={webinar.id}
                            webinarStatus='LIVE'
                        />
                    ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
                        <p className='text-xl text-foreground text-center font-semibold'>
                            Webinar has been cancelled
                        </p>
                    ) : (
                        <Button>
                            Ended
                        </Button>
                    )
                )}
            </div>

            <div className="text-center space-y-4">
                <h3 className='text-2xl font-semibold text-primary'>{webinar.title}</h3>
                <p className='text-muted-foreground text-xs'>{webinar.description}</p>

                <div className="w-full justify-center flex gap-2 flex-wrap items-center ">
                    <Button
                        variant={'outline'}
                        className='rounded-md bg-secondary backdrop-blur-2xl'

                    >
                        <CalendarIcon className='h-4 w-4 mr-2' />
                        {format(new Date(webinar.startTime), 'MMM dd, yyyy')}

                    </Button>
                    <Button
                        variant={'outline'}
                        className='rounded-md bg-secondary backdrop-blur-2xl'

                    >
                        <Clock className='h-4 w-4 mr-2' />
                        {format(new Date(webinar.startTime), 'h:mm a')}

                    </Button>
                </div>
            </div>


        </div>
    )
}

export default UpcomingWebinarState