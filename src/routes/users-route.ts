import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized or invalid token" };
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized or invalid token" };
      }

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
  .delete("/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized or invalid token" };
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized or invalid token" };
      }

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
