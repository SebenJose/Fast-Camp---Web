import type { z } from "zod";

import { reportUnauthorizedResponse } from "./session-expired";

export async function parseApiResponse<TData extends object>(
  response: Response,
  schema: z.ZodType<TData>,
): Promise<Partial<TData>> {
  reportUnauthorizedResponse(response);

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return {};
  }

  const parsedResponse = schema.safeParse(payload);

  if (parsedResponse.success) {
    return parsedResponse.data;
  }

  if (
    payload !== null &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
  ) {
    return {
      message: (payload as { message: string }).message,
    } as unknown as Partial<TData>;
  }

  return {};
}
