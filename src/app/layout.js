

export const metadata = {
  title: '🌾 Farm Tycoon',
  description: 'Farm Tycoon Game',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Farm Tycoon',
  },
};

export const viewport = {
  themeColor: '#3d8b3d',
};

import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="/css/base.css" />
        <link rel="stylesheet" href="/css/layout.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/farm.css" />
        <link rel="stylesheet" href="/css/animal.css" />
        <link rel="stylesheet" href="/css/town.css" />
        <link rel="stylesheet" href="/css/effects.css" />
        <link rel="stylesheet" href="/css/visual-upgrades.css" />
      </head>
      <body>
        <Providers>
          {children}
          <script type="module" src="/js/src/main.js"></script>
        </Providers>
      </body>
    </html>
  );
}
