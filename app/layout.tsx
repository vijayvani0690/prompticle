import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptCraft - AI-Powered Prompt Builder',
  description:
    'Generate optimized prompts for Bolt.new, Lovable, and v0 with visual wizard or AI analysis',
  keywords: ['prompt builder', 'AI', 'Bolt.new', 'Lovable', 'v0', 'website builder'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
