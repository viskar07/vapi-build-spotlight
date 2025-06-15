'use server'

import { WebinarFormState } from "@/store/useWebinarStore"
import { onAuthenticatedUser } from "./auth"
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { WebinarStatusEnum } from "@prisma/client";


function combineDateTime(date: Date, time: string, timeFormat: 'AM'| 'PM'): Date {
    const [hours, minutes] = time.split(':')
    const hoursInt = parseInt(hours,10);
    const minutesInt = parseInt(minutes || '0',10);

    if (timeFormat === 'PM' && hoursInt < 12) {
        date.setHours(hoursInt + 12);   

    }else if (timeFormat === 'AM' && hoursInt === 12) {
        date.setHours(0);
    }

    const result = date;
    result.setHours(hoursInt, minutesInt, 0, 0);
    return result
}

export const createWebinar = async (formData: WebinarFormState) => {
    try {
        const user = await onAuthenticatedUser();
        if(!user) {
            return {
                status: 404,
                message: 'Unauthorized'
            }
        }

        // TODO: check if user has a subscription
        if(!user.user?.subscription) {
            return {
                status: 404,
                message: 'Subscription Required'
            }
        }


        const presenterId = user.user!.id;

        if(!formData.basicInfo.webinarName) {
            return {
                status: 404,
                message: 'Webinar name is required'
            }
        }

        if(!formData.basicInfo.date) {
            return {
                status: 404,
                message: 'Date is required'
            }
        }
        if(!formData.basicInfo.time) {
            return {
                status: 404,
                message: 'Time is required'
            }
        }

        const combinedDateTime = combineDateTime(formData.basicInfo.date, formData.basicInfo.time, formData.basicInfo.timeFormat || 'AM');
        const now = new Date();
        if(combinedDateTime < now) {
            return {
                status: 404,
                message: 'Date and time must be in the future'
            }
        }

        const webinar = await prismaClient.webinar.create({
            data: {
                title: formData.basicInfo.webinarName,
                description: formData.basicInfo.description || '',
                startTime: combinedDateTime,
                tags: formData.cta.tags || [],
                ctaLabel: formData.cta.ctaLabel ,
                ctaType: formData.cta.ctaType ,
                priceId: formData.cta.priceId || null,
                aiAgentId: formData.cta.aiAgent || null,
                lockChat: formData.additionalInfo.lockChat || false,
                couponCode: formData.additionalInfo.couponEnabled ? formData.additionalInfo.couponCode : null,
                couponEnabled: formData.additionalInfo.couponEnabled || false,
                presenterId: presenterId ,
                thumbnail: formData.basicInfo.thumbnail || null,
            },
        })
        revalidatePath('/')
        return {
            status: 200,
            message: 'Webinar created successfully',
            webinarId:webinar.id,
            webinaeLink: `/webinars/${webinar.id}`
        }
    } catch (error) {
        console.log(error)
    }

}

export const getWebinarsByPresenterId = async (presenterId: string,webinarStatus?:string) => {
   try {

    let statusFilter: WebinarStatusEnum | undefined ;
    switch (webinarStatus) {
       case 'upcoming':
        statusFilter = WebinarStatusEnum.SCHEDULED;
        break;
        case 'ended':
        statusFilter = WebinarStatusEnum.ENDED;
        break;
        default:
            statusFilter = undefined;
            
    }
    const webinars = await prismaClient.webinar.findMany({
        where: {
            presenterId: presenterId,
            webinarStatus: statusFilter,
        },
        include: {
            presenter: {
                select: {
                    name: true,
                    stripeConnectId: true,
                    id: true,
                }
            },
        },
    })
    return webinars
   } catch (error) {
    console.log("Errors Getting Webinar:",error)
    return []
   }
}


export const getWebinarById = async (webinarId: string) => {
    try {
        const webinar = await prismaClient.webinar.findUnique({
            where: {
                id: webinarId,
            },  
            include: {
                presenter: {
                    select: {
                        name: true,
                        stripeConnectId: true,
                        id: true,
                        profileImage: true,
                    }
                }
            }
        })
        return webinar
    }catch(error) {
        console.log(error)
        return null
    }
    
}


export const changeWebinarStatus = async (webinarId: string, status: WebinarStatusEnum) => {
    try {
        const webinar = await prismaClient.webinar.update({
            where: {
                id: webinarId,
            },
            data: {
                webinarStatus: status,
            },
        })
        return {
            status: 200,
            message: 'Webinar status updated successfully',
            data: webinar,
        }
    }catch(error) {
        console.log(error)
        return {
            status: 500,
            message: 'Failed to update webinar status',
        }
    }
   
}

export const getAllWebinarIdsAndNames = async () => {
    try {
      const webinars = await prismaClient.webinar.findMany({
        select: {
          id: true,
          title: true, // assuming `title` is the name of the webinar
        },
      });
  
      return {
        status: 200,
        data: webinars.map(w => ({
          id: w.id,
          name: w.title,
        })),
      };
    } catch (error) {
      console.error('[getAllWebinarIdsAndNames]', error);
      return {
        status: 500,
        message: 'Something went wrong while fetching webinars',
        data: [],
      };
    }
  };
// export const getLeadsByWebinarId = async (webinarId: string) => {
//     try {
//         const webinar = await prismaClient.webinar.findUnique({
//             where: {
//                 id: webinarId,
//             },
//         })
//     }
// }