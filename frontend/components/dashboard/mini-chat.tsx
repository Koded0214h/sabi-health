"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useMe } from "@/lib/hooks";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MiniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Kedu! I'm Sabi, your health guardian. How you dey today? Any health matter for your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: me } = useMe();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat", { 
        message: userMsg, 
        user_id: me?.user?.id 
      });
      setMessages((prev) => [...prev, { role: "ai", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "I'm sorry, my network is a bit shaky. Try again soon!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-80 md:w-96 h-[500px] z-50 transition-all duration-500 transform",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        )}
      >
        <Card className="h-full border-none shadow-2xl flex flex-col overflow-hidden bg-white/95 backdrop-blur-md">
          <CardHeader className="bg-emerald-600 text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-200" />
              <CardTitle className="text-lg font-bold">Sabi Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-emerald-500 rounded-full h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                    msg.role === "user"
                      ? "bg-emerald-100 text-emerald-900 rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 border border-slate-200 flex gap-1">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t bg-slate-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask Sabi anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-full bg-white border-slate-200 focus-visible:ring-emerald-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
