"use client";

import React from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="error-page-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="error-content" style={{
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
        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '15px', fontWeight: '600' }}>
          Internal Server Error
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          {error?.message || 'Something went wrong. Please try again later.'}
        </p>
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details style={{
            marginBottom: '30px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '5px',
            textAlign: 'left',
            fontSize: '12px',
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid #dee2e6'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px', color: '#495057' }}>
              Error Details (Development Only)
            </summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word', 
              margin: 0,
              fontSize: '11px',
              color: '#212529'
            }}>
              {error.stack}
            </pre>
          </details>
        )}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
          >
            Try Again
          </button>
          <Link 
            href="/"
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: '#fff',
              color: '#6c757d',
              border: '1px solid #6c757d',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#6c757d';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

