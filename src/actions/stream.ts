'use server'


import { prismaClient } from '@/lib/prismaClient';
import { getStreamClient } from '@/lib/stream/streamClient';
import { Attendee, Webinar } from '@prisma/client';
import { UserRequest } from '@stream-io/node-sdk';
import { StreamVideoClient } from '@stream-io/video-react-sdk';




export const getStreamIoToken = async (attendee:Attendee | null) => {
    try{
      const newUser: UserRequest = {
        id: attendee?.id || 'guest',
        name: attendee?.name || 'Guest',
        role: 'user',
        image: `https://api.dicebear.com/7.x/initials/svg?seeds=${attendee?.name || 'Guest'}`
      } 
      await getStreamClient.upsertUsers([newUser]);
      

      const token = getStreamClient.generateUserToken({
        user_id: attendee?.id || 'guest',
        validity_in_seconds:60*60*60,
      });

      return token;


    }catch(e){
      console.log(e);
      return null;
    }
}


export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string,
) => {
  try{

    const newUser: UserRequest = {
      id: userId,
      name: username || 'Guest',
      image: profilePic || `https://api.dicebear.com/7.x/initials/svg?seeds=${username || 'Guest'}`,
      role: 'admin'

    }
    await getStreamClient.upsertUsers([newUser]);



    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds:60*60*60,
    });

    return token;
  }catch(e){
    console.log(e);
    return null;
  }
}


export const createAndStartStream = async (
  webinar: Webinar,
)=>{
  try{
    console.log(webinar);
    

    const checkWebinar = await prismaClient.webinar.findMany({
      where:{
        presenterId: webinar.presenterId,
        webinarStatus: 'LIVE'
      }
    })

    if(checkWebinar.length > 0){
      throw new Error('You have a webinar already live');
    }
   
    const call = getStreamClient.video.call('livestream', webinar.id);
    await call.getOrCreate({
      data: {
        created_by_id: webinar.presenterId,
        members:[
          {
            user_id: webinar.presenterId,
            role: 'host'
          },
        ],
      }
    });

    call.goLive()

    return 'success'

  }catch(e){
    console.log(e);
    throw new Error('Error creating stream');
  }
}


