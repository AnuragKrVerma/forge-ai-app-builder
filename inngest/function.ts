import {
  gemini,
  createAgent,
  createTool,
  TextMessage,
  Tool,
  createNetwork,
  createState,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import Sandbox from "@e2b/code-interpreter";
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import { z } from "zod";
import { PROMPT } from "./prompt";
import { channel, topic } from "@inngest/realtime";
import { routeModule } from "next/dist/build/templates/pages";
import { db } from "@/lib/db";

interface CodeAgentState {
  summary: string;
  files: Record<string, string>;
}

export const projectChannel = channel(
  (projectId: string) => `Project:${projectId}`,
).addTopic(topic("projectInfo").type<string>());

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/codeAgent.run" },
  async ({ event, step, publish }) => {
    const sandboxId = await step.run("get-or-create-sandbox", async () => {
      const { sandboxId } = await Sandbox.create("211006/forgeai-v1");
      return sandboxId;
    });

    const codeAgent = createAgent<CodeAgentState>({
      name: "coding agent",
      system: PROMPT,
      description: "An expert coding agent",
      model: gemini({
        model: "gemini-2.5-flash",
      }),

      tools: [
        createTool({
          name: "terminal",
          description: "Use terminal to run commands",
          parameters: z.object({
            command: z.string().describe("The command to run in the terminal"),
          }),
          handler: async ({ command }) => {
            const buffers = { stdout: "", stderr: "" };

            try {
              const sandbox = await getSandbox(sandboxId);
              const result = await sandbox.commands.run(command, {
                onStdout: (data: string) => {
                  buffers.stdout += data;
                },
                onStderr: (data: string) => {
                  buffers.stderr += data;
                },
              });

              return result.stdout;
            } catch (error) {
              console.error(
                `Command failed: ${error} \n Stdout: ${buffers.stdout} \n Stderr: ${buffers.stderr}`,
              );

              return `Command failed: ${error} \n Stdout: ${buffers.stdout} \n Stderr: ${buffers.stderr}`;
            }
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(z.object({ path: z.string(), content: z.string() })),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<CodeAgentState>,
          ) => {
            await publish(
              await projectChannel(event.data.projectId).projectInfo(
                "Generating project files...",
              ),
            );

            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    const fullPath = toProjectPath(file.path);
                    await sandbox.files.write(fullPath, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              },
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
              return `Successfully updated ${files.length} files.`;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files in the sandbox",
          parameters: z.object({ files: z.array(z.string()) }),
          handler: async ({ files }) => {
            return await step?.run("readFiles", async () => {
              try {
                const contents: Record<string, string>[] = [];
                const sandbox = await getSandbox(sandboxId);

                for (const file of files) {
                  const fullPath = toProjectPath(file);
                  const content = await sandbox.files.read(fullPath);
                  contents.push({
                    path: file,
                    content: content,
                  });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error" + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastMessage = result.output.findLastIndex(
            (message) => message.role === "assistant",
          );
          const message =
            (result.output[lastMessage] as TextMessage) || undefined;

          const lastTextMessage = message?.content
            ? typeof message.content === "string"
              ? message.content
              : message.content.map((c) => c.text).join("")
            : undefined;

          if (lastTextMessage && network) {
            if (lastTextMessage && network) {
              if (lastTextMessage.includes("<task_summary>")) {
                network.state.data.summary = lastTextMessage;
              }
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<CodeAgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 20,
      defaultState: createState<CodeAgentState>({
        summary: "",
        files: {},
      }),

      router: async ({ network }) => {
        if (network.state.data.summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.message);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);

      return `http://${host}`;
    });

    await step.run("save-to-db", async () => {
      const hasError = Object.keys(result.state.data.files || {}).length === 0;

      if (hasError) {
        return await db.message.create({
          data: {
            content: "Something went wrong, please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId.trim(),
          },
        });
      }

      return await db.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          projectId: event.data.projectId.trim(),
          codeFragment: {
            create: {
              sandboxUrl,
              sandboxId,
              files: result.state.data.files,
              title: "Code Fragments",
            },
          },
        },
      });
    });

    return {
      sandboxUrl,
      title: "Code Fragments",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
