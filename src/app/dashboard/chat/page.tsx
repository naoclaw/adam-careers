import { ChatPanel } from "@/components/chat-panel";

export default function DashboardChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Career Chat</h1>
        <p className="text-sm text-gray-600">
          Powered by OpenRouter + Grok mini.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
