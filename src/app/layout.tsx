
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VoiceMax - Voice that states your mental health',
  description: 'Analyze emotions in your voice with VoiceMax.',
  icons: null, // Explicitly prevent Next.js from automatic icon handling
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Any manual favicon link would go here if 'icons: null' isn't sufficient,
            but for now, we are trying to disable all favicon processing to stop the error.
            If you have a favicon.png at src/app/favicon.png, and this doesn't stop the error,
            you might later re-add: <link rel="icon" href="/favicon.png" type="image/png" />
            while keeping icons: null.
        */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
