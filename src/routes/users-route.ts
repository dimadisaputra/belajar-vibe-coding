import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

const authPlugin = (app: Elysia) =>
  app.derive(({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized or invalid token");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized or invalid token");
    }
    return { token };
  });

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .group("", (app) =>
    app.use(authPlugin)
    .get("/current", async ({ token, set }) => {
      try {
        const user = await getCurrentUser(token);
        return { data: user };
      } catch (error: any) {
        if (error.message === "Unauthorized or invalid token") {
          set.status = 401;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Internal Server Error" };
      }
    })
    .delete("/logout", async ({ token, set }) => {
      try {
        const result = await logoutUser(token);
        return { data: result };
      } catch (error: any) {
        if (error.message === "Unauthorized or invalid token") {
          set.status = 401;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Internal Server Error" };
      }
    })
  )
  .post("/", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      return { data: result };
    } catch (error: any) {
      if (error.message === "Email sudah terdaftar") {
        set.status = 409;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const token = await loginUser(body.email, body.password);
      return { data: token };
    } catch (error: any) {
      if (error.message === "Email atau password salah") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  });
