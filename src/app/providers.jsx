'use client';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
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
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#3b82f6',
              color: '#fff'
            }
          }
        }}
      />
    </>
  );
}
