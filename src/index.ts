import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

/**
 * The main Elysia application instance.
 * It registers the base route and the users route.
 */
export const app = new Elysia()
  .get("/", () => ({ status: "ok", message: "Server is running!" }))
  .use(usersRoute);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
