import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata: Metadata = { title: "Community Chat" };

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Community Chat</h1>
        <p className="mt-1 text-muted-foreground">
          Talk live with other sports fans.
        </p>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border">
        <ChatWindow userId={session?.user?.id ?? ""} userName={session?.user?.name ?? "Fan"} />
      </div>
    </div>
  );
}
