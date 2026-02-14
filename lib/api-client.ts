import { treaty } from "@elysiajs/eden";
import { App } from "../app/api/[[...slugs]]/route";

export const apiClient = treaty<App>("http://localhost:3000/api");
