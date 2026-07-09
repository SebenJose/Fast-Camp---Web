import {
  chatApiResponseSchema,
  type ChatApiMessage,
  type ChatApiResponse,
} from "../schemas/ai-chat-schemas";

const CHAT_API_BASE_URL = "/api/chat/messages";

export type SendChatMessageResult =
  | {
      ok: true;
      messages: ChatApiMessage[];
    }
  | {
      ok: false;
      aborted: boolean;
      message: string;
    };

async function readChatApiResponse(
  response: Response,
): Promise<ChatApiResponse> {
  try {
    const parsedResponse = chatApiResponseSchema.safeParse(
      await response.json(),
    );

    return parsedResponse.success ? parsedResponse.data : {};
  } catch {
    return {};
  }
}

export async function getChatMessages() {
  const response = await fetch(CHAT_API_BASE_URL).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const data = await readChatApiResponse(response);

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
      message: "Não foi possível conectar ao serviço de chat.",
    };
  }

  const data = await readChatApiResponse(response);

  if (!response.ok || !data.messages?.length) {
    return {
      ok: false,
      aborted: false,
      message: data.message ?? "Não foi possível enviar a mensagem.",
    };
  }

  return {
    ok: true,
    messages: data.messages,
  };
}
