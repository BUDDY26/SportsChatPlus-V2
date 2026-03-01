"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatMessageType } from "@/lib/sports/types";

interface SendMessagePayload {
  content: string;
  userId: string;
  userName: string;
  room?: string;
}

export function useChat(room: string = "general") {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages?room=${room}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [room]);

  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds — replace with Supabase realtime subscription in production
    const interval = setInterval(fetchMessages, 5_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (payload: SendMessagePayload) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, room }),
        });
        if (!res.ok) throw new Error("Failed to send message");
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [room]
  );

  return { messages, isLoading, error, sendMessage, refetch: fetchMessages };
}
