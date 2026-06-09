"use client";

import { BotMessageSquare, Send, Sparkles, StopCircle } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Dados de exemplo — apenas visuais
// ---------------------------------------------------------------------------

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Olá! Sou o Organiza.IA, seu assistente de produtividade. Posso te ajudar a organizar sua agenda, criar tarefas, resumir compromissos ou responder dúvidas. Como posso ajudar hoje?",
    timestamp: new Date(),
  },
];

const SUGGESTED_PROMPTS = [
  "Organize minha semana",
  "Quais são meus compromissos de hoje?",
  "Crie uma tarefa para amanhã",
  "Resuma meu dia",
];

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2",
        isUser && "flex-row-reverse",
      )}
    >
      {/* Avatar */}
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

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-card-opaque text-primary-title"
            : "rounded-tl-sm bg-input-opaque text-primary-title",
        )}
      >
        {message.content}

        {/* Timestamp */}
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

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 1;

  function handleSend(text: string = input) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simula resposta da IA (apenas visual)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Entendido! Estou processando sua solicitação. Em breve a integração com a IA estará disponível.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
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
      {/* Header */}
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

        {/* Status */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-app-muted">Online</span>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col py-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Suggested prompts — só aparece antes do primeiro envio */}
      {!hasMessages && (
        <div className="shrink-0 flex flex-wrap gap-2 px-6 pb-1">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className={cn(
                "rounded-full border border-app-border px-3 py-1.5",
                "text-xs text-app-muted transition-colors duration-150",
                "hover:border-secundary-title/50 hover:text-primary-title hover:bg-card-opaque",
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="flex items-end gap-2 rounded-xl border border-app-border bg-input-opaque p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="flex-1 border-none bg-transparent px-2 py-1.5 focus:border-none"
          />
          <Button
            size="icon"
            onClick={() => (isTyping ? setIsTyping(false) : handleSend())}
            disabled={!isTyping && !input.trim()}
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
