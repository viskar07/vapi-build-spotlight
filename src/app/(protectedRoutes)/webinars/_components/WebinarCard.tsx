import { Webinar } from '@prisma/client';
import { format } from 'date-fns';
import { AlignLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

type Props = {
    webinar: Webinar;
}

const WebinarCard = (props: Props) => {
    return (
        <div className='flex gap-3 flex-col items-start w-full transform transition-transform duration-300 ease-in-out hover:scale-102 '>
            <Link
                href={`/live-webinar/${props.webinar.id}`}
                className='w-full max-w-[400px]'
            >
                <Image
                    src={props.webinar.thumbnail ||'/darkthumbnail.png'}
                    width={400}
                    height={100}
                    alt={props.webinar.title}
                    className=' rounded-md w-[400px] h-[200px] object-cover overflow-hidden'
                />
            </Link>
            <div className="w-full flex justify-between gap-3 items-center">
                <Link
                    href={`/live-webinar/${props.webinar.id}`}
                    className=' flex flex-col gap-2  items-start'
                >
                    <div className="">
                        <p className='text-sm text-primary font-semibold'   >
                            {props.webinar.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            {props.webinar.description}
                        </p>
                    </div>
                    <div className="flex gap-2 justify-start items-center text-xs text-muted-foreground">
                        <Calendar className='w-5 h-4' />
                        <p>{format(new Date(props.webinar?.startTime), 'dd/MM/yyyy')}</p>
                    </div>
                </Link>

                <Link
                    href={`/webinars/${props.webinar.id}/pipeline`}
                    className='flex px-3 py-2 rounded-md border-[0.5px border-border bg-secondary'
                >
                    <AlignLeft className='w-4 h-4' />
                </Link>
            </div>
        </div>
    )
}

export default WebinarCard