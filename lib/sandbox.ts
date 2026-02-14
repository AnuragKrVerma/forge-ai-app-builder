import Sandbox from "@e2b/code-interpreter";

export async function getSandBox(sandboxId: string) {
  return await Sandbox.connect(sandboxId);
}
