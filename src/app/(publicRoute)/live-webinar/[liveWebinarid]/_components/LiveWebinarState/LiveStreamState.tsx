'use client'

import { useEffect, useRef, useState } from 'react'
import { StreamVideo,   } from '@stream-io/video-react-sdk'
import { StreamVideoClient, User as StreamUser} from "@stream-io/video-react-sdk";

import { User } from '@prisma/client'
import { WebinarWithPresenter } from '@/lib/type'
import CustomLiveStreamPlayer from './CustomLiveStreamPlayer'
import {  getTokenForHost } from '@/actions/stream'

type Props = {
    apiKey: string
    webinar: WebinarWithPresenter
    user: User
    callId: string
}

const LiveStreamState = ({ apiKey,  callId, webinar, user }: Props) => {
    const [hostToken, setHostToken] = useState<string | null>(null)
    const [client, setClient] = useState<StreamVideoClient | null>(null)



    useEffect(() => {
            const init = async () => {
                try {
                    const token = await getTokenForHost(
                         webinar.presenterId,
                         webinar.presenter.name,
                         webinar.presenter.profileImage,
                    )

                    if (!token) {
                        throw new Error('Failed to get host token')
                    }
                    const hostUser:StreamUser  = {
                        id: webinar.presenterId,
                        name: webinar.presenter.name,
                        image: webinar.presenter.profileImage,
                    }

                    const streamClient = new StreamVideoClient({
                        apiKey,
                        user: hostUser,
                        token,
                    }) 
                    setHostToken(token)
                    setClient(streamClient)

                }catch(err){
                    console.log(err);
                    
                }
            }
            init()
    },[apiKey,webinar])

    if (!client || !hostToken) return null
    

    return (
        <StreamVideo client={client}>
            <CustomLiveStreamPlayer
                callId={callId}
                webinar={webinar}
                username={user.name}
                callType="livestream"
                token={hostToken}
            />
        </StreamVideo>
    )
}

export default LiveStreamState