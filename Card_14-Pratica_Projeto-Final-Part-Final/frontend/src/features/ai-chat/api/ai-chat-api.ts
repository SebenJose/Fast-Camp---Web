import { parseApiResponse } from "@/shared/lib/parse-api-response";

import {
  chatApiResponseSchema,
  type ChatApiMessage,
} from "../schemas/ai-chat-schemas";

const CHAT_API_BASE_URL = "/api/chat/messages";

export type SendChatMessageResult =
  | {
      ok: true;
      messages: ChatApiMessage[];
      balance: number | null;
      scheduleUpdated: boolean;
    }
  | {
      ok: false;
      aborted: boolean;
      insufficientBalance: boolean;
      message: string;
    };

export async function getChatMessages() {
  const response = await fetch(CHAT_API_BASE_URL).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const data = await parseApiResponse(response, chatApiResponseSchema);

  return data.messages ?? null;
}

export async function sendChatMessage(
  content: string,
  signal?: AbortSignal,
): Promise<SendChatMessageResult> {
  let response: Response;

  try {
    response = await fetch(CHAT_API_BASE_URL, {
      body: JSON.stringify({ content }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal,
    });
  } catch (error) {
    return {
      ok: false,
      aborted: error instanceof DOMException && error.name === "AbortError",
      insufficientBalance: false,
      message: "Não foi possível conectar ao serviço de chat.",
    };
  }

  const data = await parseApiResponse(response, chatApiResponseSchema);

  if (!response.ok || data.messages?.length !== 2) {
    return {
      ok: false,
      aborted: false,
      insufficientBalance: response.status === 402,
      message: data.message ?? "Não foi possível enviar a mensagem.",
    };
  }

  return {
    ok: true,
    messages: data.messages,
    balance: data.balance ?? null,
    scheduleUpdated: data.scheduleUpdated ?? false,
  };
}
