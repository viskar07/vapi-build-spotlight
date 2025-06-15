"use server";

import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/type";
import { AttendedTypeEnum, CallStatusEnum, CtaTypeEnum } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getWebinarAttendance = async (
  webinarId: string,
  options: {
    includeUser?: boolean;
    userLImit?: number;
  } = { includeUser: true, userLImit: 100 }
) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: {
        id: webinarId,
      },
      select: {
        id: true,
        ctaType: true,
        tags: true,
        presenter:true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    if (!webinar) {
      return {
        success: false,
        error: "Webinar not found",
        status: 404,
      };
    }

    const attendanceCount = await prismaClient.attendance.groupBy({
      by: ["attendedType"],
      where: {
        webinarId: webinarId,
      },
      _count: {
        attendedType: true,
      },
    });

    const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
      AttendedTypeEnum,
      AttendanceData
    >;

    for (const type of Object.values(AttendedTypeEnum)) {
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      if (
        type === AttendedTypeEnum.BREAKOUT_ROOM &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      const countItem = attendanceCount.find((item) => {
        if (
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM &&
          item.attendedType === AttendedTypeEnum.ADDED_TO_CART
        ) {
          return true;
        }
        return item.attendedType === type;
      });

      result[type] = {
        count: countItem ? countItem._count.attendedType : 0,
        users: [],
      };
    }

    if (options.includeUser) {
      for (const type of Object.values(AttendedTypeEnum)) {
        if (
          (type === AttendedTypeEnum.ADDED_TO_CART &&
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
          (type === AttendedTypeEnum.BREAKOUT_ROOM &&
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL)
        )
          continue;

        const queryType =
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM
            ? AttendedTypeEnum.ADDED_TO_CART
            : type;

        if (result[type].count > 0) {
          const attendances = await prismaClient.attendance.findMany({
            where: {
              webinarId: webinarId,
              attendedType: queryType,
            },
            include: {
              user: true,
            },
            take: options.userLImit, // Limit the number of users returned
            orderBy: {
              joinedAt: "desc", // Order by joinedAt in descending order
            },
          });

          result[type].users = attendances.map((attendance) => ({
            id: attendance.userId!,
            name: attendance.user.name,
            email: attendance.user.email,
            attendedAt: attendance.joinedAt,
            stripeConnectedId: null,
            callStatus: attendance.user.callStatus,
            createdAt: attendance.user.createdAt,
            updatedAt: attendance.user.updatedAt,
            contactNo:attendance.user.contactNo
          }));
        }
      }
    }

    return {
      success: true,
      data: result,
      ctaType: webinar.ctaType,
      webinarTags: webinar.tags || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      status: 500,
    };
  }
};

export const registerAttendee = async (
 { webinarId,
  number,
  name,
  email,}:{
    webinarId: string;
    name: string;
    email: string;
    number:number
  }
) => {
  try {
    if (!webinarId || !email) {
      return {
        success: false,
        error: "WebinarId or email is required",
        status: 400,
      };
    }

    const webinar = await prismaClient.webinar.findUnique({
      where: {
        id: webinarId,
      },
    });

    if (!webinar) {
      return {
        success: false,
        error: "Webinar not found",
        status: 404,
      };
    }

    let attendee = await prismaClient.attendee.findUnique({
      where: {
        email: email,
      },
    });

    if (!attendee) {
      attendee = await prismaClient.attendee.create({
        data: { email, name ,contactNo: number,callStatus:'PENDING'},
      });
    }

    const existingAttendance = await prismaClient.attendance.findFirst({
      where: {
        webinarId: webinarId,
        attendeeId: attendee.id,
      },
      include: {
        user: true,
      },
    });

    if (existingAttendance) {
      return {
        success: true,
        error: "Attendee already registered",
        status: 200,
        data: existingAttendance,
      };
    }

    const attendance = await prismaClient.attendance.create({
      data: {
        webinarId: webinarId,
        attendeeId: attendee.id,
        attendedType: AttendedTypeEnum.REGISTERED,
      },
      include: {
        user: true,
      },
    });

    revalidatePath(`/${webinarId}`);
    return {
      success: true,
      error: null,
      status: 200,
      data: attendance,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      status: 500,
    };
  }
};

export const changeAttendeeType = async (
  attendeeId: string,
  webinarId: string,
  attendeeType: AttendedTypeEnum
) => {
  try {
    const attendance = await prismaClient.attendance.update({
      where: {
        attendeeId_webinarId: {
          attendeeId: attendeeId,
          webinarId: webinarId,
        },
      },
      data: {
        attendedType: attendeeType,
      },
    }); 
    revalidatePath(`/${webinarId}`);
    return {
      success: true,
      error: null,
      status: 200,
      data: attendance,
    };
  } 
  catch (error) {
    return {
      success: false,
      error: error,
      status: 500,
    };
  }
}


export const getAttendeeById  = async (id:string, webinarId:string) => {
  try{
    const attendee = await prismaClient.attendee.findUnique({
      where: {
        id: id,
      },
    });

    const attendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: id,
        webinarId: webinarId,
      },
    });

    if(!attendee || !attendance){
      return {
        success: false,
        error: "Attendee not found",
        status: 404,
      };
    }

    return{
      status:200,
      data:attendee,
      success:true,
      message:'Get Attendee Successfully',
    }
  }catch(error) {
    return{
      status:500,
      success:false,
      error:error,
      message:'Get Attendee Failed',
    }
  }
}


export const changeCallStatus = async (attendeeId:string,  callStatus:CallStatusEnum) => {
  try{
    const attendance = await prismaClient.attendee.update({
        where: {
          id: attendeeId,
      },
      data: {
        callStatus: callStatus,
      },
    });
    return{
      status:200,
      data:attendance,
      success:true,
      message:'Change Call Status Successfully',
    }
  }catch(error) {
    return{
      status:500,
      success:false,
      error:error,
      message:'Change Call Status Failed',
    }
  }
}



export const getAllAttendeeLeads = async () => {
  try {
    const attendances = await prismaClient.attendance.findMany({
      include: {
        user: true,
        webinar: {
          select: {
            tags: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const leadMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      tags: string[];
    }>();

    for (const record of attendances) {
      const attendee = record.user;

      if (!attendee || !attendee.email) continue;

      if (!leadMap.has(attendee.email)) {
        leadMap.set(attendee.email, {
          name: attendee.name,
          email: attendee.email,
          phone: 'N/A', // static phone value
          tags: record.webinar?.tags || [],
        });
      } else {
        // Merge tags from multiple attendances if needed
        const existing = leadMap.get(attendee.email)!;
        const newTags = record.webinar?.tags || [];
        existing.tags = Array.from(new Set([...existing.tags, ...newTags]));
      }
    }

    return Array.from(leadMap.values());
  } catch (error) {
    console.error('[getAllAttendeeLeads]', error);
    return [];
  }
};


export const getAllAttendeesWithWebinar = async () => {
  try {
    const attendance = await prismaClient.attendance.findMany({
      include: {
        user: true,      // includes Attendee model
        webinar: true,   // optional, in case you want webinar title
      },
    });

    const formatted = attendance.map((record) => ({
      attendeeId: record.attendeeId,
      name: record.user.name,
      email: record.user.email,
      contactNo: record.user.contactNo,
      webinarId: record.webinarId,
      webinarTitle: record.webinar?.title ?? '',
      attendedType: record.attendedType,
      joinedAt: record.joinedAt,
      leftAt: record.leftAt,
    }));

    return {
      status: 200,
      data: formatted,
    };
  } catch (error) {
    console.error('[GET_ATTENDEES_WITH_WEBINAR_ERROR]', error);
    return {
      status: 500,
      message: 'Internal Server Error',
    };
  }
};