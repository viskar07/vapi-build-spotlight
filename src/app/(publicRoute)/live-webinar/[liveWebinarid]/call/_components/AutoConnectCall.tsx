'use client'
import { changeCallStatus } from '@/actions/attendance';
import { createCheckoutLink } from '@/actions/stripe';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { WebinarWithPresenter } from '@/lib/type';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi/vapiClient';
import { CallStatusEnum } from '@prisma/client';
import { BotIcon, CheckCircle, Clock, Loader2, Mic, MicOff, PhoneOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';


const CallStatus = {
    CONNECTING: 'CONNECTING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
}
type Props = {
    userName?: string;
    webinar: WebinarWithPresenter;
    userId: string;
    assistantId: string;
    assistantName?: string;
    callTimeLimit?: number;

}

const AutoConnectCall = ({
    userName = 'User',
    webinar,
    userId,
    assistantId,
    assistantName = 'Ai Assistant',
    callTimeLimit = 180
}: Props) => {

    const [callStatus, setCallStatus] = useState(CallStatus.CONNECTING);
    const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
    const [userIsSpeaking, setUserIsSpeaking] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(callTimeLimit);
    const refs = useRef({
        audioStream: null as MediaStream | null,
        countdownTimer: undefined as NodeJS.Timeout | undefined,
        useSpeakingTimeout: undefined as NodeJS.Timeout | undefined,
    })


    const formatTime = (seconds: number) =>{
        const mins = Math.floor(seconds/60);
        const secs = seconds%60;
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
    }


    const cleanup = () => {
        if (refs.current.countdownTimer) {
            clearInterval(refs.current.countdownTimer);
            refs.current.countdownTimer = undefined;
        }
        if (refs.current.audioStream) {
            refs.current.audioStream.getTracks().forEach(track => track.stop());
            refs.current.audioStream = null;
        }
        if (refs.current.useSpeakingTimeout) {
            clearTimeout(refs.current.useSpeakingTimeout);
            refs.current.useSpeakingTimeout = undefined;
        }
    }

    const setupAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, });
            refs.current.audioStream = stream;

            // Simple Speech Detection using AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser)

            // Monitor Audio Levels

            const checkAudioLevel = () => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                const normalizedVolume = average / 255;

                // detect Speech on Volume
                if (normalizedVolume > 0.15 && !userIsSpeaking && !isMicMuted) {
                    setUserIsSpeaking(true);
                }

                // clear previous timeouts
                if (refs.current.useSpeakingTimeout) {
                    clearTimeout(refs.current.useSpeakingTimeout);
                }

                // rest After Short Delay
                refs.current.useSpeakingTimeout = setTimeout(() => {
                    setUserIsSpeaking(false);
                }, 500);

                requestAnimationFrame(checkAudioLevel);

            }

            checkAudioLevel();


        } catch (error) {
            console.error('Error setting up audio:', error);
        }
    }

    const toggleMicMute = () => {
        if(refs.current.audioStream){
            refs.current.audioStream.getAudioTracks().forEach(track => track.enabled = !isMicMuted);
setIsMicMuted(prev => !prev);

        }

    }

    const checkoutLink = async() => {
       try{
        if(!webinar.priceId || !webinar.presenter.stripeConnectId){
            return toast.error('Error Checking Out');
        }
        const session = await createCheckoutLink(
            webinar.priceId,
            webinar.presenter.stripeConnectId,
            userId,
            webinar.id
        );
        if(!session.sessionUrl){
            throw new Error('Session ID not found in response')
        }
        window.open(session.sessionUrl,'_blank');
       }catch(error){
        console.error(error);
        toast.error('Error Checking Out');
       }
    }

    const startCall = async() => {
        try{
            setCallStatus(CallStatus.CONNECTING)
            await vapi.start(assistantId);
            const res = await changeCallStatus(userId, CallStatusEnum.InProgress)
            if(!res.success) {
                throw new Error('Failed to update call status')

            }
            toast.success('Call started successfully')
        }catch(error){
            toast.error('Something went wrong');
            setCallStatus(CallStatus.FINISHED)
        }
    }

    const stopCall = async () => {
        try {
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);
            cleanup();
            const res = await changeCallStatus(userId, CallStatusEnum.COMPLETED);
            if (res.error) {
                throw new Error('Failed to End Call');

            }
            toast.success('Call Ended Successfully');
        } catch (error) {
            console.log('Error Stopping Call:', error);

            toast.error('Error Ending Call');
        }
    }


  useEffect(() => {
        const onCallStart = async () => {
            console.log("call Started");
            setCallStatus(CallStatus.ACTIVE);
            setupAudio();

            setTimeRemaining(callTimeLimit);

            refs.current.countdownTimer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(refs.current.countdownTimer);
                        stopCall();
                        return 0;
                    }
                    return prev - 1;
                })
            }, 1000)
        }

        const onCallEnded = () => {
            console.log('call ended');
            setCallStatus(CallStatus.FINISHED);
            cleanup();
            // onCallEnded();
        }

        const onSpeechStart = () => {
            setAssistantIsSpeaking(true);
        }

        const onSpeechEnd = () => {
            setAssistantIsSpeaking(false);
        }

        const onError = (error: Error) => {
            console.log('Vapi Error:', error);
            setCallStatus(CallStatus.FINISHED);
            cleanup();
        }


        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnded);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnded);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, [userName, callTimeLimit]);

    // TODO:VAPI CALL
    useEffect(() => {
        const timer = setTimeout(() => {
          startCall(); // deferred to avoid setState during render
        }, 0);
      
        return () => {
          clearTimeout(timer);
          stopCall();
        };
      }, []);
      

    return (
        <div className='flex flex-col h-[calc(100vh-80px)] bg-background'>
            <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 relative ">
                <div className="flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative">
                    <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
                        <Mic
                            className={cn('h-4 w-4',
                                assistantIsSpeaking ? 'text-accent-primary' : ''
                            )}
                        />
                        <span>{assistantName}</span>
                    </div>

                    <div className="h-full flex items-center justify-center">
                        <div className="relative">
                            {assistantIsSpeaking && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-20"
                                        style={{ margin: '-8px' }}
                                    />
                                    <div className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-10"
                                        style={{ margin: '-16px', animationDelay: '0.5s' }}
                                    />
                                </>
                            )}

                            <div className={cn("flex justify-center items-center rounded-full overflow-hidden  border-4 p-6  ",
                                assistantIsSpeaking ? 'border-accent-primary' : 'border-accent-secondary/50'
                            )}>
                                <BotIcon className='w-[70px] h-[70px]' />
                            </div>
                            {assistantIsSpeaking && (
                                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-2 rounded-full">
                                    <Mic className='h-5 w-5' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* user */}
                <div className="flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative">
                    <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
                        {isMicMuted ? (

                            <>
                                <MicOff 
                            className={cn('h-4 w-4 text-destructive',
                            )}
                        />
                        <span>Muted</span>
                            
                            </>
                        ) : (
                            <>

                                <Mic
                                    className={cn('h-4 w-4',
                                        userIsSpeaking ? 'text-accent-primary' : ''
                                    )}
                                />
                                <span>{userName}</span>
                            </>
                        )}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
                        <Clock className='h-4 w-4'/>
                        <span>{formatTime(timeRemaining)}</span>

                    </div>




                    <div className="h-full flex items-center justify-center">
                        <div className="relative">
                            {userIsSpeaking && !isMicMuted && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-20"
                                        style={{ margin: '-8px' }}
                                    />
                                    {/* <div className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-10"
                                        style={{ margin: '-16px', animationDelay: '0.5s' }}
                                    /> */}
                                </>
                            )}

                            <div className={cn("flex justify-center items-center rounded-full overflow-hidden  border-4",
                                isMicMuted ? 'border-destructive/50' : userIsSpeaking ? 'border-accent-secondary' : 'border-accent-secondary/50'
                            )}>
                                <Avatar className='w-[100px] h-[100px]'>
                                    <AvatarImage
                                        src={'user-avatar.png'}
                                        alt={userName}
                                    />
                                    <AvatarFallback>{userName.split('')[0]}</AvatarFallback>
                                </Avatar>

                            </div>
                            {isMicMuted && (
                                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-2 rounded-full">
                                    <MicOff className='h-5 w-5' />
                                </div>
                            )}
                            {!isMicMuted && userIsSpeaking && (
                                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-2 rounded-full">
                                    <Mic className='h-5 w-5' />
                                </div>
                            )}
                        </div>
                    </div>



                </div>

                {callStatus === CallStatus.CONNECTING && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center flex-col gap-4 z-20  ">
                        <Loader2 className='h-10 w-10 animate-spin text-accent-primary'/>

                        <h3 className='text-xl font-medium'>Connecting...</h3>
                             
                    </div>
                )}
                {callStatus === CallStatus.FINISHED && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center flex-col gap-4 z-20  ">
                        <CheckCircle className='h-10 w-10 text-accent-primary'/>
                        <h3 className='text-xl font-medium'>Call Finished</h3>
                        <p className='text-muted-foreground'>Time limit reached</p>
                             
                    </div>
                )}

            </div>

            <div className="bg-card border-t p-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                       {callStatus === CallStatus.ACTIVE && (
                        <div className="flex items-center gap-2">
                            <Clock className='h-4 w-4 text-muted-foreground'/>
                            <span className={cn(
                                "text-sm font-medium ",
                                timeRemaining < 30 ? 'text-destructive animate-pulse' : timeRemaining < 60 ? 'text-amber-500' : 'text-muted-foreground'
                            )}>
                                {formatTime(timeRemaining) } remaining

                            </span>
                        </div>
                       )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMicMute}
                            className={cn("p-3 rounded-full transition-all",
                                isMicMuted ? 'bg-destructive text-primary' : 'bg-secondary hover:bg-secondary/80 text-foreground'
                            )}
                            disabled={callStatus !== CallStatus.ACTIVE}
                        >
                            {isMicMuted ? (
                                <>
                                    <MicOff className='h-6 w-6'/>
                                </>
                            ) : (
                                <>
                                    <Mic className='h-6 w-6'/>
                                </>
                            )}
                        </button>

                        <button
                            onClick={stopCall}
                            className='p-3 rounded-full bg-destructive text-primary hover:bg-destructive/90 transition-all'
                            aria-label='End Call'
                            disabled={callStatus !== CallStatus.ACTIVE}
                        >
                            <PhoneOff className='h-6 w-6'/>
                        </button>


                    </div>
                    <Button
                        onClick={checkoutLink}
                        variant={'outline'}
                    >
                        Buy Now
                    </Button>

                    <div className="hidden md:block">
                        {callStatus === CallStatus.ACTIVE && timeRemaining < 30 && (
                            <span className="text-destructive font-medium">
                                Call ending soon
                            </span>
                        )}
                    </div>

                </div>
            </div>

        </div>
    )
}

export default AutoConnectCall