'use client';

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Paperclip, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";


export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, id: crypto.randomUUID() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '', id: crypto.randomUUID() };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage.content += chunk;

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...assistantMessage };
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans antialiased overflow-hidden" suppressHydrationWarning>
      {/* Barre latérale */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-full transition-colors shadow-lg shadow-blue-900/20">
            <span className="text-xl font-light">+</span>
            <span className="font-medium">Nouvelle discussion</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Historique</div>
          {/* Historique */}
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-400 hover:text-gray-200 truncate"
            >
              Conversation précédente {i}...
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              JS
            </div>
            <div className="text-sm">
              <div className="font-medium text-white">Capital Santé</div>
              <div className="text-xs text-gray-500">Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Zone principale */}
      <main className="flex-1 flex flex-col relative">
        {/* En-tête mobile */}
        <header className="md:hidden p-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
          <h1 className="font-semibold">Capital Santé</h1>
        </header>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Bot className="w-16 h-16 mb-4 text-gray-600" suppressHydrationWarning />
              <h2 className="text-2xl font-bold text-gray-300">Comment puis-je vous aider ?</h2>
              <p className="text-gray-500 max-w-md mt-2">
                Posez-moi des questions sur vos données de santé, vos rapports ou des informations générales.
              </p>
            </div>
          )}

          {messages.map((m: any) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-4 max-w-3xl mx-auto",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700" suppressHydrationWarning>
                  <Bot className="w-5 h-5 text-emerald-400" suppressHydrationWarning />
                </div>
              )}

              <div
                className={cn(
                  "px-4 py-3 rounded-2xl max-w-[80%] shadow-sm",
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-none"
                )}
              >
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                  {m.content}
                </div>
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-800" suppressHydrationWarning>
                  <User className="w-5 h-5 text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 max-w-3xl mx-auto justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700" suppressHydrationWarning>
                <Bot className="w-5 h-5 text-emerald-400" suppressHydrationWarning />
              </div>
              <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 sticky bottom-0 z-10">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="relative flex items-end gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-lg">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                title="Joindre un fichier"
                suppressHydrationWarning
              >
                <Paperclip className="w-5 h-5" suppressHydrationWarning />
              </button>

              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-100 placeholder-gray-500 py-2"
                value={input}
                onChange={handleInputChange}
                placeholder="Écrivez votre message..."
              />

              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                suppressHydrationWarning
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600">
                L'IA peut faire des erreurs. Vérifiez les informations importantes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
