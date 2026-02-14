import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  designImageUploader: f({
    image: {
     
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })

    .onUploadComplete(async () => {
     
     
      return { };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
