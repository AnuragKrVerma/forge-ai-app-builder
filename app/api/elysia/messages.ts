import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import Elysia from "elysia";
import { z } from "zod";
export const messages = new Elysia({ prefix: "/messages" })
  .get(
    "/",
    async ({ query }) => {
      console.log("Fetching messages for project:", query.projectId);
      const messages = await db.message.findMany({
        where: { projectId: query.projectId.trim() },
        orderBy: { updatedAt: "asc" },
        include: { codeFragment: true },
      });
      console.log(messages);
      return messages;
    },
    {
      query: z.object({
        projectId: z.string().min(3, "Project Id is required"),
      }),
    },
  )
  .post(
    "/",
    async ({ body }) => {
      console.log(body);
      const createdMessage = await db.message.create({
        data: {
          content: body.message,
          role: "USER",
          type: "RESULT",
          projectId: body.projectId.trim(),
        },
      });

      await inngest.send({
        name: "code-agent/codeAgent.run",
        data: {
          value: createdMessage.content,
          projectId: body.projectId.trim(),
        },
      });
      console.log(createdMessage);
      return createdMessage;
    },
    {
      body: z.object({
        message: z
          .string()
          .min(1, "Message is required")
          .max(1000, "Message must be less than 1000 characters"),
        projectId: z.string().min(3, "Project Id is required"),
      }),
    },
  );
