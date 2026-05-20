import React from 'react';

const Auth = ({
  handleLogin,
  authEmail,
  setAuthEmail,
  authPass,
  setAuthPass,
  isAuthLoading,
  handleContinueOffline
}) => {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Logo" style={{ height: '72px', width: 'auto' }} />
          <h1>FreelanceDoc</h1>
          <p>Welcome back! Please sign in to continue.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label>Email Address</label>
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@email.com" required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="auth-btn-primary" disabled={isAuthLoading}>
            {isAuthLoading ? 'Authenticating...' : 'Sign In / Sign Up'}
          </button>
        </form>
        <button type="button" className="auth-btn-secondary" onClick={handleContinueOffline}>
          🔌 Continue Offline (Local Storage)
        </button>
        <div className="auth-footer">
          <p>New users are registered automatically.</p>
          <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.6 }}>© 2026 FreelanceDoc — Professional Agreement System</div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
