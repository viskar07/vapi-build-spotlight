'use client'
import { changeWebinarStatus } from '@/actions/webinar'
import { cn } from '@/lib/utils'
import { WebinarStatusEnum } from '@prisma/client'
import React, { useEffect, useState } from 'react'

type Props = {
    targetDate: Date,
    className?: string | null
    webinarId: string
    webinarStatus: WebinarStatusEnum

}

const CountDownTimer = (props: Props) => {
    const [isExpired, setIsExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
    })
    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    const splitDigits = (num: number) => {
        const formatted = formatNumber(num);
        return [formatted.charAt(0), formatted.charAt(1)];
    }
    const [day1, day2] = splitDigits(timeLeft.days > 99 ? 99 : timeLeft.days);
    const [hour1, hour2] = splitDigits(timeLeft.hours);
    const [minute1, minute2] = splitDigits(timeLeft.minutes);
    const [second1, second2] = splitDigits(timeLeft.seconds);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = props.targetDate.getTime() - now.getTime();
            if (difference <= 0) {
                if (!isExpired) {
                    setIsExpired(true);

                    if (props.webinarStatus === WebinarStatusEnum.SCHEDULED) {
                        const updateStatus = async () => {
                            try {
                                await changeWebinarStatus(props.webinarId, WebinarStatusEnum.WAITING_ROOM);
                            } catch (error) {
                                console.error('Error updating webinar status:', error);
                            }
                        }

                        updateStatus();
                    }
                }
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                }
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                milliseconds: Math.floor(difference % 1000),
            }
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 50)
        return () => clearInterval(timer);

    }, [props.targetDate, props.webinarId, props.webinarStatus, isExpired])


    return (
        <div className={cn('text-center', props.className)}>
            {!isExpired && (
                <div className="flex items-center justify-center gap-4 mb-8">
                    {timeLeft.days > 0 && (
                        <div className="space-y-2">
                            <p className='text-sm text-muted-foreground'>
                                Days
                            </p>
                            <div className="flex justify-center gap-1">
                                <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                    {day1}
                                </div>
                                <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                    {day2}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <p className='text-sm text-muted-foreground'>
                            Hours
                        </p>
                        <div className="flex justify-center gap-1">
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {hour1}
                            </div>
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {hour2}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className='text-sm text-muted-foreground'>
                            Minutes
                        </p>
                        <div className="flex justify-center gap-1">
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {minute1}
                            </div>
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {minute2}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className='text-sm text-muted-foreground'>
                            Seconds
                        </p>
                        <div className="flex justify-center gap-1">
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {second1}
                            </div>
                            <div className="bg-secondary w-10 h-12 flex items-center justify-center rounded text-xl">
                                {second2}
                            </div>
                        </div>
                    </div>
                    
                </div>
            )}
        </div>
    )
}

export default CountDownTimer