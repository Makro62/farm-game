import '@/styles/globals.css';
import { GameProvider } from '@/lib/store-provider';
import { Toaster } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';
import ClearServiceWorker from '@/components/ClearServiceWorker';

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
  themeColor: '#5DBE4A'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via <link> for graceful offline fallback */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Farm Tycoon" />
      </head>
      <body className="font-body">
        <ClearServiceWorker />
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
                background: '#FFF9EC',
                color: '#4A3428',
                borderRadius: '18px',
                border: '3px solid #C4A574',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 6px 0 #A67C52, 0 10px 24px rgba(74, 52, 40, 0.15)'
              },
              success: {
                duration: 2400,
                iconTheme: {
                  primary: '#7BC47F',
                  secondary: '#FFF9EC'
                },
                style: {
                  background: '#E8F5D8',
                  color: '#3D8B4F',
                  border: '3px solid #7BC47F'
                }
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#EF5350',
                  secondary: '#fff'
                },
                style: {
                  background: '#FFEBEE',
                  color: '#C62828',
                  border: '3px solid #EF5350'
                }
              }
            }}
          />
        </GameProvider>
      </body>
    </html>
  );
}
