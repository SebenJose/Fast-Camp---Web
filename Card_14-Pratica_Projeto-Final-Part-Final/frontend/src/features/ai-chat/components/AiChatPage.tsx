"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BotMessageSquare, ChevronDown, ChevronUp, Coins, Send, Sparkles, StopCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn, getProfileInitials } from "@/shared/lib/utils";

import { getChatMessages, sendChatMessage } from "../api/ai-chat-api";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  chatInputSchema,
  type ChatApiMessage,
  type ChatMessageRole,
} from "../schemas/ai-chat-schemas";
import { AiChatPageSkeleton } from "./AiChatPageSkeleton";

const MESSAGE_PREVIEW_LENGTH = 300;
const WELCOME_MESSAGE_ID = "welcome";

interface Message {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  tokens?: number;
}

const SUGGESTED_PROMPTS = [
  "Quais são meus compromissos de hoje?",
  "Marque um estudo das 19:00 às 20:00",
  "Monte um plano para minha semana",
  "Como priorizar minhas tarefas de hoje?",
];

function getWelcomeMessage(): Message {
  return {
    id: WELCOME_MESSAGE_ID,
    role: "assistant",
    content:
      "Olá! Sou o Organiza.IA, seu assistente de produtividade. Posso te ajudar a organizar sua agenda, criar tarefas, resumir compromissos ou responder dúvidas sobre o seu planejamento. Como posso ajudar hoje?",
    timestamp: new Date(),
  };
}

function toMessage(apiMessage: ChatApiMessage): Message {
  const tokens = apiMessage.inputTokens + apiMessage.outputTokens;

  return {
    id: apiMessage.id,
    role: apiMessage.role,
    content: apiMessage.content,
    timestamp: new Date(apiMessage.createdAt),
    tokens: apiMessage.role === "assistant" && tokens > 0 ? tokens : undefined,
  };
}

function MessageBubble({
  message,
  userInitials,
}: {
  message: Message;
  userInitials: string;
}) {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  const isLong = message.content.length > MESSAGE_PREVIEW_LENGTH;
  const displayContent =
    isLong && !expanded
      ? message.content.slice(0, MESSAGE_PREVIEW_LENGTH)
      : message.content;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 gap-3 px-4 py-2",
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
            {userInitials}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "min-w-0 max-w-[min(75%,480px)] wrap-anywhere rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-card-opaque text-primary-title"
            : "rounded-tl-sm bg-input-opaque text-primary-title",
        )}
      >
        <span>
          {displayContent}
          {isLong && !expanded && "…"}
        </span>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={cn(
              "mt-1.5 flex items-center gap-0.5 text-[10px] transition-colors",
              isUser
                ? "text-primary-title/50 hover:text-primary-title/80"
                : "text-app-muted hover:text-secundary-title",
            )}
          >
            {expanded ? (
              <>
                <ChevronUp size={10} />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown size={10} />
                Ver mais
              </>
            )}
          </button>
        )}

        <p className="mt-1.5 text-[10px] text-app-muted">
          {message.timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.tokens !== undefined && (
            <span className="tabular-nums"> · {message.tokens} tokens</span>
          )}
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
  const queryClient = useQueryClient();
  const session = useAuthStore((store) => store.session);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBalanceEmpty, setIsBalanceEmpty] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingIdRef = useRef(0);
  const sendGenerationRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.some(
    (message) => message.id !== WELCOME_MESSAGE_ID,
  );
  const userInitials = getProfileInitials(
    session?.name ?? "Visitante",
    session?.email ?? "sem sessão ativa",
  );

  useEffect(() => {
    let isMounted = true;

    void getChatMessages().then((history) => {
      if (!isMounted) {
        return;
      }

      if (history === null) {
        setHistoryError(true);
        setIsLoadingHistory(false);
        return;
      }

      const restored = history.map(toMessage);
      setMessages(
        restored.length > 0 ? restored : [getWelcomeMessage()],
      );
      setIsLoadingHistory(false);
    });

    return () => {
      isMounted = false;
    };
  }, [historyAttempt]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping]);

  function handleStopResponse() {
    abortControllerRef.current?.abort();
    textareaRef.current?.focus();
  }

  async function reconcileAbortedSend(generation: number) {
    const history = await getChatMessages();

    if (sendGenerationRef.current !== generation) {
      return;
    }

    if (history && history.length > 0) {
      setMessages(history.map(toMessage));
    }

    void queryClient.invalidateQueries({ queryKey: ["billing"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    void queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  async function handleSend(text: string = input) {
    const parsedMessage = chatInputSchema.safeParse(text);

    if (!parsedMessage.success || isTyping || isBalanceEmpty) {
      return;
    }

    const content = parsedMessage.data;
    const generation = ++sendGenerationRef.current;
    pendingIdRef.current += 1;
    const optimisticMessage: Message = {
      id: `pending-${pendingIdRef.current}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const result = await sendChatMessage(content, abortController.signal);

    abortControllerRef.current = null;
    setIsTyping(false);

    if (sendGenerationRef.current !== generation) {
      return;
    }

    if (!result.ok) {
      if (result.aborted) {
        void reconcileAbortedSend(generation);
        return;
      }

      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticMessage.id),
      );
      setInput(content);

      if (result.insufficientBalance) {
        setIsBalanceEmpty(true);
      } else {
        toast.error(result.message);
      }

      return;
    }

    const [persistedUserMessage, assistantMessage] =
      result.messages.map(toMessage);

    setMessages((prev) => [
      ...prev.filter((message) => message.id !== optimisticMessage.id),
      persistedUserMessage,
      assistantMessage,
    ]);

    if (result.balance === 0) {
      setIsBalanceEmpty(true);
    }

    void queryClient.invalidateQueries({ queryKey: ["billing"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });

    if (result.scheduleUpdated) {
      void queryClient.invalidateQueries({ queryKey: ["schedule"] });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  if (isLoadingHistory) {
    return <AiChatPageSkeleton />;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden bg-primary-black">
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
        <div className="flex w-full flex-col overflow-x-hidden py-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              userInitials={userInitials}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {historyError && (
        <div className="shrink-0 px-4 pb-1">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
            <p className="min-w-0 flex-1 text-sm font-medium text-destructive">
              Não foi possível carregar o histórico de mensagens.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLoadingHistory(true);
                setHistoryError(false);
                setHistoryAttempt((attempt) => attempt + 1);
              }}
              className={cn(
                "shrink-0 rounded-lg bg-destructive/20 px-3 py-1.5 text-sm font-semibold text-destructive",
                "transition-colors hover:bg-destructive/30",
              )}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {isBalanceEmpty && (
        <div className="shrink-0 px-4 pb-1">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
            <Coins size={18} className="shrink-0 text-warning" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm font-medium text-warning">
              Seu saldo de tokens acabou. Recarregue para continuar
              conversando.
            </p>
            <Link
              href="/billing"
              className={cn(
                "shrink-0 rounded-lg bg-warning/20 px-3 py-1.5 text-sm font-semibold text-warning",
                "transition-colors hover:bg-warning/30",
              )}
            >
              Recarregar tokens
            </Link>
          </div>
        </div>
      )}

      {!hasMessages && (
        <div className="shrink-0 flex flex-wrap gap-2 px-6 pb-1">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void handleSend(prompt)}
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isBalanceEmpty
                ? "Saldo de tokens esgotado — recarregue para continuar."
                : isTyping
                  ? "Aguarde a IA responder..."
                  : "Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            }
            aria-label={
              isBalanceEmpty
                ? "Saldo de tokens esgotado"
                : isTyping
                  ? "Aguardando resposta da IA"
                  : "Mensagem para o assistente"
            }
            disabled={isTyping || isBalanceEmpty}
            rows={1}
            maxLength={CHAT_MESSAGE_MAX_LENGTH}
            className="max-h-36 min-w-0 flex-1 resize-none overflow-y-auto border-none bg-transparent px-2 py-1.5 focus:border-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={() =>
              isTyping ? handleStopResponse() : void handleSend()
            }
            disabled={(!isTyping && !input.trim()) || isBalanceEmpty}
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
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-[10px] text-app-muted">
            Organiza.IA pode cometer erros. Verifique informações importantes.
          </p>
          <span
            className={cn(
              "shrink-0 text-[10px] tabular-nums",
              input.length >= CHAT_MESSAGE_MAX_LENGTH
                ? "text-warning"
                : "text-app-muted",
            )}
          >
            {input.length}/{CHAT_MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
