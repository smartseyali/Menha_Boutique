"use client";

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px',
            padding: '40px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '80px', color: '#dc3545', marginBottom: '20px' }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '15px' }}>
              Application Error
            </h1>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
              {error?.message || 'A critical error occurred. Please refresh the page.'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

