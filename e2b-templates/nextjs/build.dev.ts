import "dotenv/config";
import { Template, defaultBuildLogger } from "e2b";
import { template as nextJSTemplate } from "./template";

async function main() {
  await Template.build(nextJSTemplate, "forgeai-v1", {
    cpuCount: 2,
    memoryMB: 4096,
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch((err) => {
  console.error("Error building template:", err);
});
