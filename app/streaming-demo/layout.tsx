import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 流式对话演示 | 老板IP打造方案生成器',
  description: '体验基于 SiliconFlow 和 OpenAI 的流式响应聊天功能，支持多种模型和实时交互',
  keywords: ['AI聊天', '流式响应', 'SiliconFlow', 'OpenAI', 'DeepSeek'],
  openGraph: {
    title: 'AI 流式对话演示',
    description: '体验基于 SiliconFlow 和 OpenAI 的流式响应聊天功能',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface StreamingDemoLayoutProps {
  children: React.ReactNode;
}

export default function StreamingDemoLayout({ children }: StreamingDemoLayoutProps) {
  return (
    <div className="streaming-demo-layout">
      {children}
    </div>
  );
}