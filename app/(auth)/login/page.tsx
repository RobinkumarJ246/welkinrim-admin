'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        document.cookie = 'welkinrim-session=true; path=/; max-age=86400; SameSite=Strict';
        const from = searchParams.get('from');
        router.push(from || '/');
        router.refresh();
      } else {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Geometric background pattern */}
      <div className="bg-pattern" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-accent-1" />
        <div className="bg-accent-2" />
      </div>

      <div className="login-shell">
        {/* Brand Panel */}
        <div className="brand-panel">
          <div className="brand-inner">
            <div className="brand-mark">
              <svg viewBox="0 0 100 100" width="52" height="52">
                <rect x="20" y="20" width="60" height="60" fill="#E8A800" rx="4" />
                <rect x="30" y="30" width="8" height="40" fill="#0E0E0F" />
                <rect x="46" y="30" width="8" height="40" fill="#0E0E0F" />
                <rect x="62" y="30" width="8" height="40" fill="#0E0E0F" />
                <line x1="90" y1="10" x2="10" y2="90" stroke="#E8A800" strokeWidth="3" />
              </svg>
            </div>
            <h1 className="brand-name">WELKINRIM</h1>
            <p className="brand-tag">Industrial Admin Console</p>

            <div className="brand-divider" />

            <div className="brand-info">
              <div className="brand-info-item">
                <span className="info-dot" />
                <span>Product Management</span>
              </div>
              <div className="brand-info-item">
                <span className="info-dot" />
                <span>Order Tracking</span>
              </div>
              <div className="brand-info-item">
                <span className="info-dot" />
                <span>Analytics & Reporting</span>
              </div>
            </div>

            <div className="brand-footer">
              <p>Welkinrim Technologies Pvt. Ltd.</p>
              <p>Oragadam Industrial Corridor, Chennai</p>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="form-panel">
          <div className="form-inner">
            <div className="form-header">
              <div className="form-eyebrow">SECURE ACCESS</div>
              <h2 className="form-title">Sign In</h2>
              <p className="form-subtitle">Enter your credentials to access the admin console</p>
            </div>

            {error && (
              <div className="form-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="username" className="field-label">Username</label>
                <div className="field-wrap">
                  <span className="field-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="10" cy="7" r="3" />
                      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="field-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="password" className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="9" width="14" height="10" rx="2" />
                      <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    className="field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`submit-btn${isLoading ? ' loading' : ''}`}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="demo-hint">
              <span className="demo-label">Demo credentials</span>
              <span className="demo-cred"><code>admin</code> / <code>admin123</code></span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ─── Page Shell ─────────────────────────────────────────────── */
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          background: #0E0E0F;
          position: relative;
          overflow: hidden;
        }

        /* ─── Background ─────────────────────────────────────────────── */
        .bg-pattern {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(232,168,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,168,0,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .bg-accent-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,168,0,0.07) 0%, transparent 70%);
          top: -150px;
          left: -100px;
        }
        .bg-accent-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,168,0,0.05) 0%, transparent 70%);
          bottom: -100px;
          right: 30%;
        }

        /* ─── Shell Layout ───────────────────────────────────────────── */
        .login-shell {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 960px;
          margin: auto;
          min-height: 100vh;
          align-items: stretch;
        }

        /* ─── Brand Panel ────────────────────────────────────────────── */
        .brand-panel {
          display: none;
          flex: 0 0 380px;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(232,168,0,0.15);
          padding: 48px 40px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
        }
        @media (min-width: 760px) {
          .brand-panel { display: flex; }
        }

        .brand-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .brand-mark {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 20px;
        }
        .brand-name {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #FFFFFF;
          margin-bottom: 6px;
        }
        .brand-tag {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E8A800;
          opacity: 0.9;
        }
        .brand-divider {
          width: 32px;
          height: 2px;
          background: #E8A800;
          margin: 32px 0;
          border-radius: 1px;
        }
        .brand-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }
        .brand-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }
        .info-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E8A800;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .brand-footer {
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.07);
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.25);
          line-height: 1.9;
          text-transform: uppercase;
        }

        /* ─── Form Panel ─────────────────────────────────────────────── */
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .form-inner {
          width: 100%;
          max-width: 380px;
        }
        .form-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #E8A800;
          margin-bottom: 12px;
        }
        .form-title {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #FFFFFF;
          margin-bottom: 10px;
        }
        .form-subtitle {
          font-family: var(--font-body, sans-serif);
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        /* ─── Error ──────────────────────────────────────────────────── */
        .form-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 4px;
          color: #F87171;
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          margin-bottom: 24px;
          letter-spacing: 0.03em;
        }

        /* ─── Fields ─────────────────────────────────────────────────── */
        .field-group {
          margin-bottom: 20px;
        }
        .field-label {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
        }
        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.25);
          display: flex;
          pointer-events: none;
          transition: color 200ms;
        }
        .field-input {
          width: 100%;
          height: 46px;
          padding: 0 14px 0 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: #FFFFFF;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          letter-spacing: 0.02em;
          transition: border-color 200ms, background 200ms, box-shadow 200ms;
          outline: none;
          -webkit-appearance: none;
        }
        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .field-input:focus {
          border-color: #E8A800;
          background: rgba(232,168,0,0.04);
          box-shadow: 0 0 0 3px rgba(232,168,0,0.1);
        }
        .field-input:focus + .field-icon,
        .field-wrap:focus-within .field-icon {
          color: #E8A800;
        }
        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .field-wrap .field-icon { z-index: 1; }
        .field-wrap .field-input { z-index: 0; }

        /* ─── Submit Button ───────────────────────────────────────────── */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 48px;
          margin-top: 8px;
          background: #E8A800;
          border: none;
          border-radius: 4px;
          color: #0E0E0F;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 200ms, transform 100ms, box-shadow 200ms;
          box-shadow: 0 4px 20px rgba(232,168,0,0.25);
        }
        .submit-btn:hover:not(:disabled) {
          background: #F5B800;
          box-shadow: 0 6px 28px rgba(232,168,0,0.4);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(232,168,0,0.2);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .submit-btn.loading {
          background: rgba(232,168,0,0.7);
        }

        /* ─── Spinner ─── */
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(14,14,15,0.3);
          border-top-color: #0E0E0F;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Demo Hint ───────────────────────────────────────────────── */
        .demo-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .demo-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
        .demo-cred {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }
        .demo-cred code {
          background: rgba(232,168,0,0.1);
          color: #E8A800;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 11px;
        }

        /* ─── Mobile fallback ─────────────────────────────────────────── */
        @media (max-width: 759px) {
          .login-page {
            background: #0E0E0F;
          }
          .login-shell {
            padding: 0;
          }
          .form-panel {
            padding: 48px 24px;
          }
        }
      `}</style>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="form-panel">
          <div className="form-inner">
            <div className="form-header">
              <div className="form-eyebrow">SECURE ACCESS</div>
              <h2 className="form-title">Sign In</h2>
              <p className="form-subtitle">Loading...</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          background: #0E0E0F;
        }
        .login-shell {
          display: flex;
          width: 100%;
          max-width: 960px;
          margin: auto;
          min-height: 100vh;
          align-items: stretch;
        }
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .form-inner {
          width: 100%;
          max-width: 380px;
        }
        .form-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #E8A800;
          margin-bottom: 12px;
        }
        .form-title {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #FFFFFF;
          margin-bottom: 10px;
        }
        .form-subtitle {
          font-family: var(--font-body, sans-serif);
          font-size: 14px;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}