import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

/**
 * Elysia plugin for extracting and validating the Bearer token from the Authorization header.
 * 
 * @param app - The Elysia app instance.
 * @returns An Elysia app with the derived token.
 * @throws Error if the token is missing or invalid.
 */
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

/**
 * Route handler for user-related endpoints.
 * Includes routes for registration, login, getting the current user, and logout.
 */
export const usersRoute = new Elysia({ prefix: "/api/users" })
  .group("", (app) =>
    app.use(authPlugin)
    .onError(({ error, set }) => {
      if (error.message === "Unauthorized or invalid token") {
        set.status = 401;
        return { error: error.message };
      }
    })
    .get("/current", async ({ token }) => {
      const user = await getCurrentUser(token);
      return { data: user };
    }, {
      response: {
        200: t.Object({
          data: t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            created_at: t.Nullable(t.Date())
          })
        }),
        401: t.Object({
          error: t.String()
        })
      },
      detail: {
        tags: ['Users'],
        summary: 'Get Current User',
        description: 'Get the profile information of the currently authenticated user.'
      }
    })
    .delete("/logout", async ({ token }) => {
      const result = await logoutUser(token);
      return { data: result };
    }, {
      response: {
        200: t.Object({
          data: t.String()
        }),
        401: t.Object({
          error: t.String()
        })
      },
      detail: {
        tags: ['Users'],
        summary: 'Logout User',
        description: 'Invalidate the user session/token.'
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
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      409: t.Object({
        error: t.String()
      }),
      500: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Register User',
      description: 'Register a new user account.'
    }
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
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        error: t.String()
      }),
      500: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Login User',
      description: 'Login with email and password to receive a token.'
    }
  });
