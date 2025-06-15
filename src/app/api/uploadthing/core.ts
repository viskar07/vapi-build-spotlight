import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server"; // ✅ Clerk Auth import

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // ✅ Use Clerk auth to get user ID
      const session = await auth();
      const userId = session.userId;

      if (!userId) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Upload complete for userId:", metadata.userId);
      console.log("📁 File URL:", file.ufsUrl); // or file.ufsUrl depending on your config

      // Optional: Save to DB or log
      // await saveToDatabase(metadata.userId, file.url);

      return { uploadedBy: metadata.userId, id: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
