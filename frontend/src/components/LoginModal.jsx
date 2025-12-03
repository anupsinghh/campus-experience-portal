import { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../context/AuthContext.jsx';

function LoginModal({ onClose, initialEmail = '' }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      await login(email, password);
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
              Email
              <input
                type="email"
                className="login-modal-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <span className="login-modal-link">Register</span>
          </p>
        </div>

        <div className="login-modal-right">
          <div className="login-modal-shape login-modal-shape-main" />
          <div className="login-modal-shape login-modal-shape-small" />
          <p className="login-modal-quote">
            “Share your journey and help others prepare for theirs.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;


