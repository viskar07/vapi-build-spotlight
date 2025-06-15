"use server";

import { prismaClient } from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticatedUser = async () => {
  try {
    const user = await currentUser();
    if (!user)
      return {
        staus: 403,
      };

    const userExists = await prismaClient.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });
    if (userExists) {
      return {
        status: 200,
        user: userExists,
      };
    }
    const newUser = await prismaClient.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profileImage: user.imageUrl,
      },
    });

    if (!newUser) {
      return {
        status: 500,
        message: "Failed to create user",
      };
    }
    return {
      status: 201,
      user: newUser,
    };
  } catch (error) {
    console.log("🚫 ERROR: ", error);
    return {
      status: 500,
      message: "Internal Server Error",
    };
  }
};
