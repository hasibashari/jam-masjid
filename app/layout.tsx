import type {Metadata} from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import PwaProvider from '@/features/pwa/components/PwaProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Jam Masjid Digital TV',
  description: 'Digital display board for Mosque with offline support and auto-sync.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jam Masjid',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-zinc-950 text-white min-h-screen">
        <PwaProvider>
          {children}
        </PwaProvider>
      </body>
    </html>
  );
}
