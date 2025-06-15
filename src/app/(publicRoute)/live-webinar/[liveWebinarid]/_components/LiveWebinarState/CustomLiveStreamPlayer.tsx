'use client'
import { WebinarWithPresenter } from '@/lib/type'
import { Call, StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import LiveWebinarViewComponent from '../Common/LiveWebinarComponent'

type Props = {
    username: string
    callId: string
    callType: string
    webinar: WebinarWithPresenter
    token: string
}

const CustomLiveStreamPlayer = ({username,callId,callType,webinar,token}: Props) => {

    const client = useStreamVideoClient()
    const [call, setCall] = useState<Call>()
    const [showChat, setShowChat] = useState(true)

    useEffect(() => {
        if(!client) return
        const myCall = client.call(callType, callId)
        
        setCall(myCall)

        myCall.join({create:true}).then(
            
            () => setCall(myCall),
            () => console.log('Failed to join call')
        );
    

        return () => {
            // myCall.leave().catch(err => {
            //     console.log(err)
            // })
            setCall(undefined)
        }
    }, [client, callId, callType])

    if (!call) return null

  return (
    <StreamCall call={call}>
        <LiveWebinarViewComponent
            webinar={webinar}
            username={username}
            showChat={showChat}
            setShowChat={setShowChat}
            isHost={true}
            userToken={token}
            userId={webinar.presenterId}
            call={call}
        />

    </StreamCall>
  )
}

export default CustomLiveStreamPlayer