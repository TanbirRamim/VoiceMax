
import type { Metadata, IconDescriptor } from 'next'; // Added IconDescriptor
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

const faviconDescriptors: IconDescriptor[] = [
  {
    url: '/favicon.png', // Next.js serves src/app/favicon.png at /favicon.png
    type: 'image/png',
    sizes: 'any', // Or you can specify exact sizes like '32x32'
  },
];

export const metadata: Metadata = {
  title: 'VoiceMax - Voice that states your mental health',
  description: 'Analyze emotions in your voice with VoiceMax.',
  icons: {
    icon: faviconDescriptors, // Using the more explicit IconDescriptor array
    // You can also add other icon types here if needed:
    // apple: '/apple-icon.png',
    // shortcut: '/shortcut-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Metadata API will handle link tag generation */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
