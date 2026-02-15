import { Elysia } from "elysia";
import { messages } from "../elysia/messages";
import { projects } from "../elysia/projects";

const app = new Elysia().use(messages).use(projects);

const handler = async (
  req: Request,
  { params }: { params: Promise<{ slugs?: string[] }> },
) => {
  const resolvedParams = await params;
  const path = "/" + (resolvedParams.slugs?.join("/") ?? "");
  const url = new URL(req.url);
  url.pathname = path;
  return app.fetch(new Request(url, req));
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;

export type App = typeof app;
