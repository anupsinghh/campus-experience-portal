import { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../context/AuthContext.jsx';

function RegisterModal({ onClose }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('student'); // 'student' | 'alumni'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        // backend derives role from isAlumni when role not provided
        isAlumni: accountType === 'alumni',
      });
      onClose?.();
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
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
          <h2 className="login-modal-title">Create account</h2>
          <p className="login-modal-subtitle">
            Join the community and start sharing your placement experiences.
          </p>

          <form onSubmit={handleSubmit} className="login-modal-form">
            <label className="login-modal-label">
              Full name
              <input
                type="text"
                className="login-modal-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <div className="login-modal-label">
              Account type
              <div className="login-modal-radio-group">
                <label className="login-modal-radio">
                  <input
                    type="radio"
                    name="accountType"
                    value="student"
                    checked={accountType === 'student'}
                    onChange={() => setAccountType('student')}
                  />
                  <span>Student</span>
                </label>
                <label className="login-modal-radio">
                  <input
                    type="radio"
                    name="accountType"
                    value="alumni"
                    checked={accountType === 'alumni'}
                    onChange={() => setAccountType('alumni')}
                  />
                  <span>Alumni</span>
                </label>
              </div>
            </div>

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
                placeholder="Create a password"
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="login-modal-footer-text">
            Already have an account?{' '}
            <span className="login-modal-link">Login</span>
          </p>
        </div>

        <div className="login-modal-right">
          <div className="login-modal-shape login-modal-shape-main" />
          <div className="login-modal-shape login-modal-shape-small" />
          <p className="login-modal-quote">
            “Every shared experience makes placements a little less scary for someone else.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;


