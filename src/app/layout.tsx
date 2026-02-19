import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Background } from '@/components/background';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'HackConnect',
  description:
    'Intelligently match with teammates for your next hackathon project.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        <AuthProvider>
          <Background />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
