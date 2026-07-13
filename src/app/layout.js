import { Fredoka, Nunito } from 'next/font/google';
import '@/styles/globals.css';
import { GameProvider } from '@/lib/store-provider';
import { Toaster } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';

const display = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-body',
});

export const metadata = {
  title: '🌾 Farm Tycoon - Game Bertani Seru!',
  description: 'Tanam, panen, dan jadi tycoon pertanian!',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icons/icon-512.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2f6b3a'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Farm Tycoon" />
      </head>
      <body className="font-body">
        <GameProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: '88px',
              zIndex: 9999
            }}
            toastOptions={{
              duration: 2800,
              style: {
                background: '#2a4630',
                color: '#f4f7e8',
                borderRadius: '16px',
                border: '2px solid #5d8f4a',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 8px 24px rgba(20, 40, 20, 0.35)'
              },
              success: {
                duration: 2400,
                iconTheme: {
                  primary: '#7ec850',
                  secondary: '#1f331f'
                },
                style: {
                  background: '#2f5d34',
                  color: '#f4f7e8',
                  border: '2px solid #7ec850'
                }
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ff6b5a',
                  secondary: '#fff'
                },
                style: {
                  background: '#5a2a28',
                  color: '#fff',
                  border: '2px solid #ff6b5a'
                }
              }
            }}
          />
        </GameProvider>
      </body>
    </html>
  );
}
