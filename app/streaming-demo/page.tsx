import ChatStreaming from '@/components/chat-streaming';

export default function StreamingDemoPage() {
  return (
    <div className="min-h-screen">
      <ChatStreaming />
    </div>
  );
}

export const metadata = {
  title: 'AI 流式对话演示',
  description: '基于 OpenAI GPT 的流式响应聊天界面',
};