import { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModals } from '../context/AuthModalContext.jsx';

function LoginModal({ onClose, initialEmail = '' }) {
  const { login } = useAuth();
  const { openRegister } = useAuthModals();
  const [identifier, setIdentifier] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    // Trim and validate inputs
    const trimmedIdentifier = identifier?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setError('Please provide email/username and password');
      setLoading(false);
      return;
    }

    try {
      await login(trimmedIdentifier, trimmedPassword);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div
        className="login-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="login-modal-close-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="login-modal-left">
          <div className="login-modal-logo">
            <span className="login-modal-star">*</span>
            <span>Placement Portal</span>
          </div>
          <h2 className="login-modal-title">Login</h2>
          <p className="login-modal-subtitle">
            Welcome back! Please enter your details to continue.
          </p>

          <form onSubmit={handleSubmit} className="login-modal-form">
            <label className="login-modal-label">
              Email or Username
              <input
                type="text"
                className="login-modal-input"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </label>

            <label className="login-modal-label">
              Password
              <input
                type="password"
                className="login-modal-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="login-modal-error">{error}</div>}

            <button
              type="submit"
              className="login-modal-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>

          <p className="login-modal-footer-text">
            Don't have an account?{' '}
            <span className="login-modal-link" onClick={openRegister} style={{ cursor: 'pointer' }}>Register</span>
          </p>
        </div>

        <div className="login-modal-right">
          <div className="login-modal-shape login-modal-shape-main" />
          <div className="login-modal-shape login-modal-shape-small" />
          <div className="login-modal-illustration">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Person with briefcase - success */}
              <circle cx="200" cy="120" r="45" fill="rgba(129, 140, 248, 0.2)" />
              <circle cx="200" cy="110" r="25" fill="rgba(99, 102, 241, 0.3)" />
              <rect x="185" y="135" width="30" height="50" rx="15" fill="rgba(99, 102, 241, 0.25)" />
              {/* Briefcase */}
              <rect x="175" y="185" width="50" height="35" rx="4" fill="rgba(129, 140, 248, 0.3)" />
              <rect x="180" y="190" width="40" height="25" rx="2" fill="rgba(99, 102, 241, 0.2)" />
              <line x1="195" y1="185" x2="195" y2="220" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" />
              <line x1="205" y1="185" x2="205" y2="220" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" />
              
              {/* Growth arrow/stairs */}
              <path d="M120 280 L180 240 L240 200 L300 160" stroke="rgba(244, 114, 182, 0.4)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="120" cy="280" r="4" fill="rgba(244, 114, 182, 0.5)" />
              <circle cx="300" cy="160" r="6" fill="rgba(244, 114, 182, 0.6)" />
              
              {/* Stars/success indicators */}
              <path d="M280 100 L282 108 L290 108 L283 113 L285 121 L280 116 L275 121 L277 113 L270 108 L278 108 Z" fill="rgba(251, 191, 36, 0.4)" />
              <path d="M130 200 L131 205 L136 205 L132 208 L133 213 L130 210 L127 213 L128 208 L123 205 L128 205 Z" fill="rgba(251, 191, 36, 0.3)" />
              <path d="M320 250 L321 255 L326 255 L322 258 L323 263 L320 260 L317 263 L318 258 L313 255 L318 255 Z" fill="rgba(251, 191, 36, 0.35)" />
              
              {/* Connection dots/network */}
              <circle cx="150" cy="320" r="8" fill="rgba(129, 140, 248, 0.25)" />
              <circle cx="250" cy="320" r="8" fill="rgba(129, 140, 248, 0.25)" />
              <line x1="158" y1="320" x2="242" y2="320" stroke="rgba(129, 140, 248, 0.2)" strokeWidth="2" />
            </svg>
          </div>
          <p className="login-modal-quote">
            “Share your journey and help others prepare for theirs.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;


