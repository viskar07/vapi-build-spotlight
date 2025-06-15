'use server'

import { aiAgentPrompt } from "@/lib/data"
import { prismaClient } from "@/lib/prismaClient"
import { PhoneNumber } from "@/lib/type"
import { vapi } from "@/lib/vapi/vapiClient"
import { vapiServer } from "@/lib/vapi/vapiServer"
import { auth } from "@clerk/nextjs/server"
import Vapi from "@vapi-ai/web"

const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY!

export const getAllAssistants = async () => {
  try {
  const getAllAgents = await vapiServer.assistants.list()
  return {
    data: getAllAgents,
    status: 200,
    success: true,
  }
  }catch (error) {
    return {
      error: error,
      status: 500,
      success: false,
    }
  }
}


export const createAssistant = async (name: string) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
        name: name,
        firstMessage: `Hi there, this is ${name} form customer support. How can I help you today?`,
        model:{
          model: "gpt-4o",
          provider: "openai",
          messages: [
            {
              role: "system",
              content: aiAgentPrompt,
            },
          ],
          temperature: 0.5,

        }
      })

    
      return {
        data: createAssistant,
        status: 200,
        success: true,
      }

  }catch (error) {
    return {
      error: error,
      status: 500,
      success: false,
    }
  }
  
}


export const updateAssistant = async (assistantId: string, firstMessage: string, systemPrompt: string) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(
      assistantId,{
      firstMessage: firstMessage,
      model:{
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      }
    })

    return {
      data: updateAssistant,
      status: 200,
      success: true,
    }
  } catch (error) {
    return {
      error: error,
      status: 500,
      success: false,
    } 
  }
}

interface TwilioCredentialResponse {
  id: string;
  // add other response fields as needed
}

interface PhoneNumberResponse {
  id: string;
  // add other response fields as needed
}

export async function setupTwilioSIPTrunk(
  twilioGatewayId: string,
  sipPhoneNumber: string
) {
  try {
    // Step 1: Create SIP trunk credential
    const credentialResponse = await fetch('https://api.vapi.ai/credential', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vapiApiKey}`
      },
      body: JSON.stringify({
        provider: 'byo-sip-trunk',
        name: 'Twilio Trunk',
        gateways: [{
          ip: twilioGatewayId
        }],
        outboundLeadingPlusEnabled: true
      })
    });

    if (!credentialResponse.ok) {
      throw new Error('Failed to create SIP trunk credential');
    }

    const credential: TwilioCredentialResponse = await credentialResponse.json();

    // Step 2: Register phone number
    const phoneResponse = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vapiApiKey}`
      },
      body: JSON.stringify({
        provider: 'byo-phone-number',
        name: 'Twilio SIP Number',
        number: sipPhoneNumber,
        numberE164CheckEnabled: false,
        credentialId: credential.id
      })
    });

    if (!phoneResponse.ok) {
      throw new Error('Failed to register phone number');
    }

    const phoneNumber: PhoneNumberResponse = await phoneResponse.json();

    return {
      success: true,
      phoneNumberId: phoneNumber.id
    };

  } catch (error) {
    console.error('Error setting up Twilio SIP trunk:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function listUserVapiCallsIds() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await prismaClient.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        vapiCall: {
          select: {
            id: true,
            name: true,
            vapiCallCredential:true
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    return {
      success: true,
      phoneNumbers: user.vapiCall, // same shape as listPhoneNumbers
    };
  } catch (error) {
    console.error('Error fetching VapiCalls:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}






// Types
interface Attendee {
  name: string
  phoneNumber: string
}
interface CallMetadata {
  callId: string
  attendeeId: string
}
export async function initiateVapiCall({
  vapiNumber,
  providerId,
  attendees,
  metadata
}: {
  vapiNumber: string
  providerId: string
  attendees: Attendee[]
  metadata: CallMetadata
}) {
  try {
    const callPromises = attendees.map(async (attendee) => {
      try {
        // Create call using Vapi
        const call = await Vapi.caller({
          phoneNumber: attendee.phoneNumber,
          assistant: {
            id: providerId,
          },
          from: vapiNumber,
          metadata: {
            ...metadata,
            attendeeName: attendee.name,
          }
        })


      
        return {
          success: true,
          callId: call.id,
          attendee
        }
      } catch (error) {
        console.error(`Call failed for ${attendee.name}:`, error)
        return { success: false, attendee, error }
      }
    })
    const results = await Promise.all(callPromises)
    return { success: true, calls: results }
  } catch (error) {
    console.error('Call initiation failed:', error)
    return { success: false, error }
  }
}




export async function handleCallReport(message: any) {
  const {
    endedReason,
    recordingUrl,
    summary,
    transcript,
    startTime,
    endTime,
    metadata
  } = message;

  const attendeeId = metadata?.attendeeId;
  const callId = metadata?.callId;

  if (!attendeeId || !callId) {
    console.warn('Missing metadata: attendeeId or callId');
    return;
  }

  try {
    await prismaClient.callResponce.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        summary,
        recordingUrl,
        fullTranscript: transcript,
        endReason: endedReason,
        attendee: { connect: { id: attendeeId } },
        call: { connect: { id: callId } },
      }
    });

    console.log('✅ CallResponce saved for call:', callId);
  } catch (error) {
    console.error('❌ Failed to save CallResponce:', error);
  }
}
