import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GameProvider } from "@/lib/store-provider";
import { Toaster } from "react-hot-toast";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "🌾 Farm Tycoon - Game Bertani Seru!",
  description: "Tanam, panen, dan jadi tycoon pertanian!",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5DBE4A",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via <link> for graceful offline fallback */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Farm Tycoon" />
      </head>
      <body className="font-body">
        <GameProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: "88px",
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 2800,
              style: {
                background: "#FFFCF5",
                color: "#4A3428",
                borderRadius: "12px",
                border: "2px solid #D4C4A8",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
              success: {
                duration: 2400,
                iconTheme: {
                  primary: "#22C55E",
                  secondary: "#F0FDF4",
                },
                style: {
                  background: "#F0FDF4",
                  color: "#166534",
                  border: "2px solid #86EFAC",
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FEF2F2",
                },
                style: {
                  background: "#FEF2F2",
                  color: "#991B1B",
                  border: "2px solid #FCA5A5",
                },
              },
            }}
          />
        </GameProvider>
      </body>
    </html>
  );
}
