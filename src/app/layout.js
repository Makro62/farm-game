import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { GameProvider } from '@/lib/store-provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

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
  themeColor: '#3d8b3d'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Farm Tycoon" />
      </head>
      <body className={inter.className}>
        <GameProvider>
          {children}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: '80px',
              zIndex: 9999
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              },
              success: {
                duration: 2500,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff'
                },
                style: {
                  background: '#10b981',
                  color: '#fff'
                }
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                },
                style: {
                  background: '#ef4444',
                  color: '#fff'
                }
              }
            }}
          />
        </GameProvider>
      </body>
    </html>
  );
}
