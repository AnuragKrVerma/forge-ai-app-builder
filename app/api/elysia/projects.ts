import Elysia from "elysia";
export const projects = new Elysia({ prefix: "/projects" }).post(
  "/",
  async () => {
    return { messages: "hello from elysia in next js" };
  },
);
