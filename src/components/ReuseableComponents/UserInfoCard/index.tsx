import { cn } from '@/lib/utils';
import { Attendee } from '@prisma/client';
import React from 'react'

type Props = {
    customer: Attendee;
    tags: string[];
    className?: string;
}

const UserInfoCard = (props: Props) => {
  return (
    <div className={cn('flex flex-col w-full text-primary p-3 pr-10 rounded-xl border-[0.5px] border-border backdrop-blur-[20px] bg-background/10',props.className)}>
        <h3 className='font-semibold text-md'>{props.customer.name}</h3>
        <p className='text-sm'>{props.customer.email}</p>
        <div className="flex gap-2 flex-wrap">
            {props.tags.map((tag,index) => (
                <span key={index} className='text-foreground px-3 py-1 rounded-md border border-border'>{tag}</span>
            ))}
        </div>

    </div>
  )
}

export default UserInfoCard