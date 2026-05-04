import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/", () => ({ status: "ok", message: "Server is running!" }))
  .use(usersRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
