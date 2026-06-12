import {
  getMockAuthSession,
  loginMockUser,
  logoutMockUser,
  registerMockUser,
} from "../lib/mock-auth-storage";
import {
  authApiResponseSchema,
  type AuthApiResponse,
  type LoginFormData,
  type RegisterFormData,
} from "../schemas/auth-schemas";
import type { MockAuthSession } from "../types/auth";

export type AuthActionResult =
  | {
      ok: true;
      session: MockAuthSession;
    }
  | {
      ok: false;
      message: string;
    };

const AUTH_API_BASE_URL = "/api/auth";
const MISSING_API_STATUS = 404;
const shouldUseMockAuthFallback = process.env.NODE_ENV === "development";

function shouldFallbackToMockAuth(response: Response | null) {
  return (
    shouldUseMockAuthFallback &&
    (!response || response.status === MISSING_API_STATUS)
  );
}

async function readAuthApiResponse(response: Response): Promise<AuthApiResponse> {
  try {
    const parsedResponse = authApiResponseSchema.safeParse(
      await response.json(),
    );

    return parsedResponse.success ? parsedResponse.data : {};
  } catch {
    return {};
  }
}

export async function getAuthSession() {
  const response = await fetch(`${AUTH_API_BASE_URL}/session`).catch(() => null);

  if (shouldFallbackToMockAuth(response)) {
    return getMockAuthSession();
  }

  if (!response) {
    return null;
  }

  const data = await readAuthApiResponse(response);

  if (!response.ok) {
    return null;
  }

  return data.session ?? null;
}

export async function loginWithCredentials(
  credentials: LoginFormData,
): Promise<AuthActionResult> {
  const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
    body: JSON.stringify(credentials),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);

  if (shouldFallbackToMockAuth(response)) {
    return loginMockUser(credentials);
  }

  if (!response) {
    return {
      ok: false,
      message: "Não foi possível conectar ao serviço de autenticação.",
    };
  }

  const data = await readAuthApiResponse(response);

  if (!response.ok || !data.session) {
    return {
      ok: false,
      message: data.message ?? "Não foi possível realizar o login.",
    };
  }

  return {
    ok: true,
    session: data.session,
  };
}

export async function registerWithCredentials(
  credentials: RegisterFormData,
): Promise<AuthActionResult> {
  const response = await fetch(`${AUTH_API_BASE_URL}/register`, {
    body: JSON.stringify(credentials),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);

  if (shouldFallbackToMockAuth(response)) {
    return registerMockUser(credentials);
  }

  if (!response) {
    return {
      ok: false,
      message: "Não foi possível conectar ao serviço de autenticação.",
    };
  }

  const data = await readAuthApiResponse(response);

  if (!response.ok || !data.session) {
    return {
      ok: false,
      message: data.message ?? "Não foi possível criar a conta.",
    };
  }

  return {
    ok: true,
    session: data.session,
  };
}

export async function logoutAuthSession() {
  const response = await fetch(`${AUTH_API_BASE_URL}/logout`, {
    method: "POST",
  }).catch(() => null);

  if (shouldFallbackToMockAuth(response)) {
    logoutMockUser();
  }
}
