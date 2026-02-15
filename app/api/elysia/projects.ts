import Elysia from "elysia";
import { messages } from "./messages";
import { db } from "@/lib/db";
import { z } from "zod";
import { inngest } from "@/inngest/client";
export const projects = new Elysia({ prefix: "/projects" }).post(
  "/",
  async ({ body }) => {
    const createdProject = await db.project.create({
      data: {
        name: `Project-${Date.now()}`,
        messages: {
          create: {
            content: body.message,
            role: "USER",
            type: "RESULT",
          },
        },
      },
    });

    await inngest.send({
      name: "code-agent/codeAgent.run",
      data: {
        message: body.message,
        projectId: createdProject.id,
      },
    });

    return createdProject;
  },
  {
    body: z.object({
      message: z
        .string()
        .min(3, "Message is required")
        .max(1000, "Message is too long"),
    }),
  },
);
