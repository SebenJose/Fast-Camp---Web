import { http, HttpResponse } from "msw";

import {
  getMockAuthSession,
  loginMockUser,
  logoutMockUser,
  registerMockUser,
} from "../lib/mock-auth-storage";
import { loginSchema, registerSchema } from "../schemas/auth-schemas";

export const authHandlers = [
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      session: getMockAuthSession(),
    });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const parsedLogin = loginSchema.safeParse(await request.json());

    if (!parsedLogin.success) {
      return HttpResponse.json(
        { message: "Revise os dados de login e tente novamente." },
        { status: 400 },
      );
    }

    const result = loginMockUser(parsedLogin.data);

    if (!result.ok) {
      return HttpResponse.json({ message: result.message }, { status: 401 });
    }

    return HttpResponse.json({ session: result.session });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    const parsedRegister = registerSchema.safeParse(await request.json());

    if (!parsedRegister.success) {
      return HttpResponse.json(
        { message: "Revise os dados do cadastro e tente novamente." },
        { status: 400 },
      );
    }

    const result = registerMockUser(parsedRegister.data);

    if (!result.ok) {
      return HttpResponse.json({ message: result.message }, { status: 409 });
    }

    return HttpResponse.json({ session: result.session }, { status: 201 });
  }),

  http.post("/api/auth/logout", () => {
    logoutMockUser();

    return HttpResponse.json({ session: null });
  }),
];
