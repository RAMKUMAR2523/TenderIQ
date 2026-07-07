"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, User, Bot } from "lucide-react";
import { toast } from "sonner";

export default function ChatClient() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your AI Tender Assistant. You can ask me anything about government tenders, eligibility requirements, or to explain complex clauses." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Mocking AI response for the hackathon demo since real API isn't wired without keys
      setTimeout(() => {
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: "Based on the tender documents, yes, your company is eligible to apply. The key requirement is an annual turnover of 5Cr, which your profile indicates you meet. Would you like me to draft a technical proposal?"
          }
        ]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      toast.error("Failed to fetch AI response");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Tender Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Chat with your intelligent assistant to analyze tenders and draft proposals.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-3 rounded-lg ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-2 rounded-full h-10 w-10 flex items-center justify-center bg-muted">
                  <Bot size={20} />
                </div>
                <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-background border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a tender..."
              className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
