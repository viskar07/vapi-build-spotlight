'use client';
import { Button } from '@/components/ui/button';
import { WebinarWithPresenter } from '@/lib/type';
import { Attendee, CtaTypeEnum } from '@prisma/client';
import { Call, ParticipantView, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Loader2, MessageSquare, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react';
import CTADialogBox from './CTADialogBox';
import {  getStreamIoToken } from '@/actions/stream';
import { changeWebinarStatus } from '@/actions/webinar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ObsDialogBox from './ObsDialogBox';

type Props = {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  webinar: WebinarWithPresenter;
  isHost?: boolean;
  username: string;
  userToken: string;
  userId: string;
  call: Call ;
  attendee?: Attendee | null;
};

const LiveWebinarViewComponent = ({
  showChat,
  setShowChat,
  webinar,
  isHost,
  userId,
  username,
  userToken,
  call,
  attendee,
}: Props) => {
  const { useParticipantCount, useParticipants } = useCallStateHooks();
  const viewerCount = useParticipantCount();
  const participants = useParticipants();

  

  // States
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [obsDialobBox, setObsDialogOpen] = useState<boolean>(false);
  const hostParticipant = participants.length > 0 ? participants[0] : null;
  const router = useRouter();


  // Function
  const handleCTAButtonClick = () => {
    if (!channel) return;
    channel.sendEvent({
      type: 'open_cta_dialog',
    });
  };

  const handleEndStream = async () => {
    setLoading(true);
    try {
      call.stopLive({
        continue_recording: false,
      });
      call.endCall();
      const res = await changeWebinarStatus(webinar.id, 'ENDED');
      if (!res.data) {
        throw new Error('Failed to change webinar status');
      }
      router.push('/');
      toast.success('Webinar ended successfully');
    } catch (error) {
      toast.error('Failed to end webinar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
        const tokenProvider = async () => {
          const token = await getStreamIoToken(attendee || null);
          return token!;
        };

        await chatClient.connectUser(
          {
            id: userId,
            name: username,
          },
          tokenProvider
        );

        const channelInstance = chatClient.channel('livestream', webinar.id, {
          name: webinar.title,
        });
        await channelInstance.watch();

        setClient(chatClient);
        setChannel(channelInstance);
      } catch (error) {
        console.error('Error connecting to Stream:', error);
      }
    };

    initChat();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [userId, username, userToken, webinar.id, attendee]);


  useEffect(() => {
    if(channel && client){
      channel.on((event:any)=>{
        if(event.type === 'open_cta_dialog'){
          setDialogOpen(true);
        }
        if(event.type === 'start_live'){
          window.location.reload();
        }
      })
    }
  }, [channel, isHost]);


  


  
 



  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="py-2 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
          </span>
          Live
        </div>

        <div className="flex justify-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 px-3 py-1 rounded-full">
            <Users size={16} />
            <span className="text-sm">{viewerCount}</span>
          </div>

          <button
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${showChat ? 'bg-accent-primary text-primary-foreground' : 'bg-muted/50 '
              }`}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare size={16} />
            <span className="text-sm">Chat</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card">
          <div className="flex-1 relative overflow-hidden">
            {hostParticipant ? (
              <div className="w-full h-full speaker-view">
                <ParticipantView
                  participant={hostParticipant}
                  ParticipantViewUI={null}
                  className="w-full h-full !min-w-full"
                />
              </div>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-muted-foreground flex-col space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <Users size={24} className="text-muted-foreground" />
                </div>
                <p>Waiting for stream to start...</p>
              </div>
            )}

            {isHost && (
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                Host
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium capitalize">{webinar.title}</div>
            </div>

            {isHost && (
              <div className="flex items-center space-x-1">
                <Button
                  onClick={()=>setObsDialogOpen(true)}
                  variant={'outline'}
                  className='mr-2'

                >
                  Get OBS Cred
                </Button>
                <Button
                  onClick={async()=>{
                    await channel.sendEvent({
                      type: 'start_live',
                    })
                  }}
                  variant={'outline'}
                  className='mr-2'

                >
                  Go Live
                </Button>
                <Button onClick={handleEndStream} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'End Stream'
                  )}
                </Button>
                <Button onClick={handleCTAButtonClick}>
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL ? 'Book a call' : 'Buy now'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {showChat && client && channel && (
          <Chat client={client!}>
            <Channel channel={channel!}>
              <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col ">
                <div className="py-2 text bg-card px-3 border-b  border-border font-medium flex items-center justify-between ">
                  <span className='text-primary'>Chat</span>
                  <span className="text-sm bg-muted text-primary px-2 py-0.5 rounded-full">
                    {viewerCount} Viewers
                  </span>
                </div>
                <MessageList />

                <div className="p-2 border-t border-border">
                  <MessageInput />
                </div>
              </div>
            </Channel>
          </Chat>
        )}

        

        {!isHost && dialogOpen && (
          <CTADialogBox
            open={dialogOpen}
            webinar={webinar}
            userId={userId}
            onOpenChange={setDialogOpen}
          />
        )}
        {/* {!isHost && (
               <VapiViewer 
               language="hi" // or any other supported language
               onLanguageChange={(lang) => console.log('Language changed to:', lang)}
               className="w-full h-full" // optional styling
             />

        )} */}
        {obsDialobBox && (
          <ObsDialogBox
            open={obsDialobBox}
            onOpenChange={setObsDialogOpen}
            rtmpURL={`rtmps://ingress.stream-io-video.com:443/${process.env.NEXT_PUBLIC_STREAM_API_KEY}.livestream.${webinar.id}`}
            streamKey={userToken}
          />
        )}
      </div>
    </div>
  );
};

export default LiveWebinarViewComponent;
