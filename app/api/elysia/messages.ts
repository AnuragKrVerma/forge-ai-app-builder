import { inngest } from "@/inngest/client";
import Elysia from "elysia";
import { z } from "zod";
export const messages = new Elysia({ prefix: "/messages" })
  .get("/", async () => {
    return "Hello from Elysia!";
  })
  .post(
    "/",
    async ({ body }) => {
      await inngest.send({
        name: "code-agent/codeAgent.run",
        data: {
          message: body.message,
        },
      });
    },
    {
      body: z.object({
        message: z
          .string()
          .min(1, "Message is required")
          .max(1000, "Message must be less than 1000 characters"),
      }),
    },
  );
