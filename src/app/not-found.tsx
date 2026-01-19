"use client";

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="not-found-content" style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: '40px',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '80px', color: '#6c757d', marginBottom: '20px', fontWeight: 'bold' }}>
          404
        </div>
        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '15px', fontWeight: '600' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/"
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: '#fff',
              color: '#6c757d',
              border: '1px solid #6c757d',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
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
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

