"use client";

import { BotMessageSquare, Send, Sparkles, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

const CHAT_MESSAGES_STORAGE_KEY = "organiza-ai:ai-chat-messages";
const messageRoleSchema = z.enum(["user", "assistant"]);

type MessageRole = z.infer<typeof messageRoleSchema>;

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "Organize minha semana",
  "Quais são meus compromissos de hoje?",
  "Crie uma tarefa para amanhã",
  "Resuma meu dia",
];

const chatMessageSchema = z.string().trim().min(1);
const storedMessageSchema = z.object({
  id: z.string().min(1),
  role: messageRoleSchema,
  content: z.string().min(1),
  timestamp: z.string().datetime(),
});
const storedMessagesSchema = z.array(storedMessageSchema).min(1);

function isBrowser() {
  return typeof window !== "undefined";
}

function getInitialMessages(): Message[] {
  return [
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o Organiza.IA, seu assistente de produtividade. Posso te ajudar a organizar sua agenda, criar tarefas, resumir compromissos ou responder dúvidas. Como posso ajudar hoje?",
      timestamp: new Date(),
    },
  ];
}

function getStoredMessages() {
  if (!isBrowser()) {
    return getInitialMessages();
  }

  try {
    const storedMessages = window.localStorage.getItem(
      CHAT_MESSAGES_STORAGE_KEY,
    );

    if (!storedMessages) {
      return getInitialMessages();
    }

    const parsedMessages = storedMessagesSchema.safeParse(
      JSON.parse(storedMessages),
    );

    if (!parsedMessages.success) {
      return getInitialMessages();
    }

    return parsedMessages.data.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch {
    return getInitialMessages();
  }
}

function saveStoredMessages(messages: Message[]) {
  if (!isBrowser()) {
    return;
  }

  const storedMessages = storedMessagesSchema.safeParse(
    messages.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString(),
    })),
  );

  if (!storedMessages.success) {
    return;
  }

  window.localStorage.setItem(
    CHAT_MESSAGES_STORAGE_KEY,
    JSON.stringify(storedMessages.data),
  );
}

function getNextMessageId(messages: Message[]) {
  const numericMessageIds = messages
    .map((message) => Number(message.id))
    .filter((messageId) => Number.isInteger(messageId) && messageId > 0);

  return Math.max(1, ...numericMessageIds) + 1;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2",
        isUser && "flex-row-reverse",
      )}
    >
      {!isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-opaque text-secundary-title">
          <BotMessageSquare size={16} strokeWidth={1.8} />
        </div>
      ) : (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-card-opaque text-primary-title">
            US
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-card-opaque text-primary-title"
            : "rounded-tl-sm bg-input-opaque text-primary-title",
        )}
      >
        {message.content}

        <p className="mt-1.5 text-[10px] text-app-muted">
          {message.timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-opaque text-secundary-title">
        <BotMessageSquare size={16} strokeWidth={1.8} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-input-opaque px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-app-muted animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(getStoredMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const nextMessageIdRef = useRef(getNextMessageId(messages));
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isResponsePendingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 1;

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }

      isResponsePendingRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping]);

  function createMessageId() {
    const nextId = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    return nextId.toString();
  }

  function clearPendingResponse() {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }

    isResponsePendingRef.current = false;
  }

  function handleStopResponse() {
    clearPendingResponse();
    setIsTyping(false);
    textareaRef.current?.focus();
  }

  function handleSend(text: string = input) {
    const parsedMessage = chatMessageSchema.safeParse(text);

    if (!parsedMessage.success || isResponsePendingRef.current) {
      return;
    }

    const trimmed = parsedMessage.data;
    isResponsePendingRef.current = true;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    responseTimeoutRef.current = setTimeout(() => {
      const aiMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content:
          "Entendido! Estou processando sua solicitação. Em breve a integração com a IA estará disponível.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      isResponsePendingRef.current = false;
      responseTimeoutRef.current = null;
    }, 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-screen flex-col bg-primary-black">
      <header className="flex shrink-0 items-center gap-3 border-b border-app-border px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card-opaque text-secundary-title">
          <Sparkles size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-primary-title">
            Organiza.IA
          </h1>
          <p className="text-xs text-app-muted">Assistente de produtividade</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-app-muted">Online</span>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="flex flex-col py-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {!hasMessages && (
        <div className="shrink-0 flex flex-wrap gap-2 px-6 pb-1">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              className={cn(
                "rounded-full border border-app-border px-3 py-1.5",
                "text-xs text-app-muted transition-colors duration-150",
                "hover:border-secundary-title/50 hover:text-primary-title hover:bg-card-opaque",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="flex items-end gap-2 rounded-xl border border-app-border bg-input-opaque p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isTyping
                ? "Aguarde a IA responder..."
                : "Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            }
            aria-label={
              isTyping
                ? "Aguardando resposta da IA"
                : "Mensagem para o assistente"
            }
            disabled={isTyping}
            rows={1}
            className="flex-1 border-none bg-transparent px-2 py-1.5 focus:border-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => (isTyping ? handleStopResponse() : handleSend())}
            disabled={!isTyping && !input.trim()}
            aria-label={isTyping ? "Parar resposta da IA" : "Enviar mensagem"}
            aria-busy={isTyping}
            className={cn(
              "shrink-0 transition-all duration-150",
              isTyping
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : "bg-secundary-title/20 text-secundary-title hover:bg-secundary-title/30",
            )}
          >
            {isTyping ? (
              <StopCircle size={18} strokeWidth={1.8} />
            ) : (
              <Send size={16} strokeWidth={2} />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-app-muted">
          Organiza.IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}
