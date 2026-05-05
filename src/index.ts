import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "./routes/users-route";

/**
 * The main Elysia application instance.
 * It registers the base route and the users route.
 */
export const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "Dokumentasi API untuk manajemen User dan Autentikasi.",
        },
      },
    })
  )
  .get("/", () => ({ status: "ok", message: "Server is running!" }))
  .use(usersRoute);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
