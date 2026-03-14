"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
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
    // Load existing history on mount / room change
    fetchMessages();

    // Subscribe to new messages via Supabase Realtime
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${room}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room=eq.${room}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            user_name: string;
            content: string;
            room: string;
            created_at: string;
          };
          const msg: ChatMessageType = {
            id: row.id,
            userId: row.user_id,
            userName: row.user_name,
            content: row.content,
            room: row.room,
            createdAt: row.created_at,
          };
          // Deduplicate against the optimistic append in sendMessage
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, room]);

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
