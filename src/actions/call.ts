'use server'
import { CallFormState } from "@/store/useCallStore";
import { onAuthenticatedUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export const  createCall = async (formData: CallFormState) => {
    try {
      const user = await onAuthenticatedUser();
      if (!user) {
        return {
          status: 401,
          message: 'Unauthorized',
        };
      }
  
      if (!user.user?.subscription) {
        return {
          status: 403,
          message: 'Subscription Required',
        };
      }
  
  
      if (!formData.info.agenda) {
        return {
          status: 400,
          message: 'Agenda is required',
        };
      }
  
      if (!formData.info.description) {
        return {
          status: 400,
          message: 'Description is required',
        };
      }
  
  
  
      const call = await prismaClient.calls.create({
        data: {
          agenda: formData.info.agenda,
          description: formData.info.description,
          aiAgentId: formData.info.aiAgent || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          vapiCallId:formData.credential.vapiCredential!

          // Optional: store the vapiCredential in a related model if needed
        },
      });
  
      // Optionally associate with user's credential if modeled separately
  
      revalidatePath('/calls');
  
      return {
        status: 200,
        message: 'Call created successfully',
        callId: call.id,
        callLink: `/calls/${call.id}`,
      };
    } catch (error) {
      console.error('Error creating call:', error);
      return {
        status: 500,
        message: 'Internal Server Error',
      };
    }

};



export async function addVapiCallId(name: string, vapiId:string) {
    const { userId } = await auth(); // ensure user is authenticated
    if (!userId) throw new Error('Unauthorized');
    
    const user = await prismaClient.user.findUnique({
      where: { clerkId: userId },
    });
  
    if (!user) throw new Error('User not found');
  
    const vapiCall = await prismaClient.vapiCall.create({
      data: {
        name,
        vapiCallCredential: vapiId,
      },
    });
  
    return vapiCall;
  }

  export async function getUserCalls() {
    const { userId: clerkId } = await auth()
    if (!clerkId) throw new Error('Unauthorized')
  
    // Get the user by clerkId
    const user = await prismaClient.user.findUnique({
      where: { clerkId },
      include: {
        vapiCall: {
          include: {
            calls: true, // If you relate from VapiCall to Calls directly
          },
        },
      },
    })
  
    if (!user) throw new Error('User not found')
  
    // Collect all calls from each VapiCall entry
    const calls = user.vapiCall.flatMap(vc => vc.calls ?? [])
  
    return calls
  }



  
export async function getAttendeesWithResponseByCallId(callId: string) {
    try {
      const callResponses = await prismaClient.callResponce.findMany({
        where: {
          callId: callId,
        },
        include: {
          attendee: true, // include attendee details
        },
      });
  
      // Map attendees and their responses
      const attendeesWithResponse = callResponses.map((response) => ({
        attendee: response.attendee,
        response: {
          id: response.id,
          startTime: response.startTime,
          endTime: response.endTime,
          summary: response.summary,
          recordingUrl: response.recordingUrl,
          fullTranscript: response.fullTranscript,
          endReason: response.endReason,
        },
      }));
  
      return attendeesWithResponse;
    } catch (error) {
      console.error("Error fetching attendees with responses:", error);
      throw new Error("Failed to fetch data");
    }
  }