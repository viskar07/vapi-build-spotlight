import { getStreamIoToken } from '@/actions/stream';
import { Button } from '@/components/ui/button';
import { WebinarWithPresenter } from '@/lib/type';
import { useAttendeeStore } from '@/store/useAttendeeStore';
import { StreamCall, StreamVideo,Call, StreamVideoClient } from '@stream-io/video-react-sdk';
import { AlertCircle, Loader2, WifiOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import {  type User } from 'stream-chat';
import LiveWebinarViewComponent from '../Common/LiveWebinarComponent';

type Props = {
    apiKey: string;
    webinar:WebinarWithPresenter
    callId: string;
}

const Participant = ({apiKey, webinar, callId}: Props) => {

    const {attendee} = useAttendeeStore();
    const [showChat, setShowChat] = useState<boolean>(true);
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'failed' | 'reconnecting' | 'connected' >('connecting');
    const clientInitialized = useRef<boolean>(false);

    useEffect(() => {
        if(clientInitialized.current) return;

        const initializeClient = async () => {
            try{
                setConnectionStatus('connecting');
                const user:User = {
                    id: attendee!.id || 'guest',
                    name: attendee!.name || 'Guest',
                    image: `https://api.dicebear.com/7.x/initials/svg?seeds=${attendee?.name || 'Guest'}`,
                }
                const userToken = await getStreamIoToken(attendee);
                setToken(userToken);

                const streamClient = new StreamVideoClient({apiKey,user,token:userToken!});
                
                streamClient.on('connection.changed',(event) => {
                    if(event.online){
                        setConnectionStatus('connected');
                    }else {
                        setConnectionStatus('reconnecting');
                    }
                })
                await streamClient.connectUser(user,userToken!);
                const streamCall = streamClient.call('livestream',callId);
                await streamCall.join({create: true});

                setCall(streamCall);
                setClient(streamClient);
                setConnectionStatus('connected');
                clientInitialized.current = true;
                



            }catch(error){
                console.log(error)
                setConnectionStatus('failed');
            }


        }

        initializeClient();

        return () => {
            const currentCall = call;
            const currentClient = client;

            if(currentCall && currentClient){
                currentCall.leave().then(() => {
                    currentClient.disconnectUser();
                    clientInitialized.current = false;
                })
               
            }
            
        }
    },[apiKey,callId,attendee,call,client,webinar.id])

    if(!attendee){
        <div className='flex items-center justify-center h-screen bg-background text-foreground'>
        <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
            <h2 className='text-2xl font-bold mb-4' >
                Please Register to attend this webinar
            </h2>
            <p className='text-muted-foreground mb-6'>  
                Registration is required to attend this webinar.
            </p>
            <Button 
                onClick={()=> window.location.reload()}
                className='bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground'
            >
                Register Now
            </Button>
        </div>

    </div>
    }

    if(!client || !call || !token){
        return (
            <div className='flex items-center justify-center h-screen bg-background text-foreground'>
                <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
                    {connectionStatus === 'connecting' && (
                        <>
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 rounded-full border-t-2 border-accent-primart animate-spin">
                              
                            </div>
                            <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center ">
                                <Loader2 className='w-10 h-10 text-accent-primary animate-pluse' />
                            </div>

                        </div>
                        <h2 className='text-xl font-semibold mb-2'>
                            Joining Webinar
                        </h2>
                        <p className='text-muted-foreground'>
                            Connecting to {webinar.title}
                        </p>

                        <div className="mt-6 flex justify-center space-x-1 ">
                            <span className="h-2 w-2 bg-accent-primary rounded-full animate-bounce" />
                            <span className="h-2 w-2 bg-accent-primary rounded-full animate-bounce"
                                style={{animationDelay: '0.2s'}}
                            />
                            <span className="h-2 w-2 bg-accent-primary rounded-full animate-bounce"
                                style={{animationDelay: '0.4s'}}
                            />
                        </div>
                    </>
                    )}
                    {
                        connectionStatus === 'reconnecting' && (
                            <>
                                <div className="mx-auto w-16 h-16 mb-4 text-amber-500">
                                    <WifiOff className='w-16 h-16 animate-pluse' />
                                </div>
                                <h2 className='text-xl font-semibold mb-2'>
                                    Reconnecting
                                </h2>
                                <p className='text-muted-foreground mb-4'>
                                    Connecting to {webinar.title}
                                </p>
                                <div className="w-full bg-muted rounded-full h-2 mb-6">
                                    <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{width:'60%'}} />
                                </div>
                            </>
                        )
                    }
                    {
                        connectionStatus === 'failed' && (
                            <>
                                <div className="mx-auto w-16 h-16 mb-4 text-destructive">
                                    <AlertCircle className='w-16 h-16 ' />
                                </div>
                                <h2 className='text-xl font-semibold mb-6'>connection Failed</h2>
                                <p className="text-muted-foreground mb-6">
                                    {errorMessage || 'Unable to connect to the webinar.'}
                                </p>

                                <div className="flex space-x-4 justify-center ">
                                    <Button 
                                        onClick={()=> window.location.reload()}
                                        variant={'outline'}
                                    >Try Again</Button>
                                    <Button 
                                        onClick={()=> window.location.href = '/'}
                                        variant={'outline'}
                                    >Back To Home</Button>
                                </div>

                            </>
                        )
                    }
                </div>

        </div>
        )
    }


    return (
    <StreamVideo client={client}>
        <StreamCall call={call} >
            <LiveWebinarViewComponent
                webinar={webinar}
                showChat={showChat}
                setShowChat={setShowChat}
                isHost={false}
                username={attendee?.name || 'Guest'}
                userId={attendee?.id || 'guest'}
                userToken={token}
                call={call}
                attendee={attendee}
            />
            
        </StreamCall>
    </StreamVideo>
  )

}

export default Participant