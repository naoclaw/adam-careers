import { ChatPanel } from "@/components/chat-panel";

export const metadata = { title: "AI Coach — Adam Careers" };

export default function DashboardChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ask anything about your CV, cover letters, or interview prep — your
          profile is loaded automatically.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
