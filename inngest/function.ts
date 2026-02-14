import { gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import Sandbox from "@e2b/code-interpreter";
import { getSandBox } from "@/lib/sandbox";

export const codeAgent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/codeAgent.run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-or-create-sandbox", async () => {
      const { sandboxId } = await Sandbox.create("211006/forgeai-v1");
      return sandboxId;
    });

    const summerizerAgent = createAgent({
      name: "Summerizer Agent",
      description: "You summarize long professional docs",
      system:
        "You are an expert summerizer that can summerize professional into one sentences",
      model: gemini({
        model: "gemini-2.5-flash",
      }),
    });

    const { output } = await summerizerAgent.run(
      `Summarize the below text: ${event.data.message}`,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandboxId);
      const host = await sandbox.getHost(3000);

      return `http://${host}`;
    });
    return { output, sandboxUrl };
  },
);
