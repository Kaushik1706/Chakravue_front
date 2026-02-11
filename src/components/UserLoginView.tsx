import { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, CreditCard, Building2, BarChart3 } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

type AuthSuccess = (user: { username: string; role: string }) => void;
type NavigationCallback = (view: 'payment-setup' | 'organization-login' | 'admin-dashboard') => void;

export function UserLoginView({ onAuthSuccess, onNavigate }: { onAuthSuccess?: AuthSuccess; onNavigate?: NavigationCallback }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'receptionist'
  });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    (async () => {
      try {
        if (isLogin) {
          const res = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username, password: formData.password, role: formData.role })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Invalid credentials');
          }

          const data = await res.json();
          onAuthSuccess && onAuthSuccess({ username: data.username, role: (data.role || '').toLowerCase() });

        } else {
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
          }

          const res = await fetch(API_ENDPOINTS.USERS_NEW, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username, full_name: formData.fullName, password: formData.password, role: formData.role })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to create account');
          }

          const data = await res.json();
          alert('Account created successfully. You can now sign in.');
          onAuthSuccess && onAuthSuccess({ username: data.username, role: (data.role || '').toLowerCase() });
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred');
      }
    })();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', overflow: 'auto' }}>
      <div className="main-container" style={{ width: '100%', maxWidth: '1440px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', margin: '0 auto' }}>
        {/* Left Side - Eye Animation */}
        {/* <div className="animation-container" style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          animation: 'fadeIn 1s ease-out 0.2s forwards'
        }}>
          <div style={{ width: '100%', maxWidth: '500px', transition: 'all 700ms' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <DotLottieReact
              src="https://lottie.host/b5b7ed31-15c2-4330-8079-66bdb0953b6a/GSFYyjO0z4.json"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div> */}

        {/* Right Side - Login Form */}
        <div className="form-container" style={{ flex: 1, maxWidth: '28rem', width: '100%', opacity: 0, animation: 'fadeIn 1s ease-out 0.4s forwards' }}>
          {/* Logo/Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div 
              style={{ 
                width: '6rem', 
                height: '6rem', 
                margin: '0 auto 1.5rem', 
                borderRadius: '100%', 
                background: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                // boxShadow: '0 25px 50px -12px rgba(212, 165, 116, 0.4)',
                transition: 'all 500ms',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(212, 165, 116, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(212, 165, 116, 0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src="/logo.jpeg"
                alt="Chakravue AI Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </div>
            <h1 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>Chakravue AI</h1>
            <p style={{ color: '#B8B8B8', fontSize: '1rem' }}>
              {isLogin ? 'Welcome back, sign in to continue' : 'Join us and create your account'}
            </p>
          </div>

          {/* Login/Signup Card */}
          <div style={{
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(42, 42, 42, 0.5)',
            borderRadius: '1rem',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transition: 'all 500ms'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Username */}
              <div style={{ transition: 'all 300ms' }}>
                <label style={{ color: '#B8B8B8', display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#8B8B8B', transition: 'color 300ms' }} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '0.875rem',
                      paddingBottom: '0.875rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '0.75rem',
                      color: 'white',
                      transition: 'all 300ms',
                      outline: 'none'
                    }}
                    placeholder="Enter your username"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4A574';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 116, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Full Name - Only for signup */}
              {!isLogin && (
                <div style={{ transition: 'all 300ms', animation: 'slideIn 0.3s ease-out' }}>
                  <label style={{ color: '#B8B8B8', display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#8B8B8B' }} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        paddingLeft: '3rem',
                        paddingRight: '1rem',
                        paddingTop: '0.875rem',
                        paddingBottom: '0.875rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '0.75rem',
                        color: 'white',
                        transition: 'all 300ms',
                        outline: 'none'
                      }}
                      placeholder="Enter your full name"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#D4A574';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 116, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2a2a2a';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Role - Only for signup */}
              {!isLogin && (
                <div style={{ transition: 'all 300ms', animation: 'slideIn 0.3s ease-out' }}>
                  <label style={{ color: '#B8B8B8', display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '0.75rem',
                      color: 'white',
                      transition: 'all 300ms',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4A574';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 116, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="receptionist" style={{ backgroundColor: '#1a1a1a' }}>Receptionist</option>
                    <option value="opd" style={{ backgroundColor: '#1a1a1a' }}>OPD</option>
                    <option value="doctor" style={{ backgroundColor: '#1a1a1a' }}>Doctor</option>
                    <option value="patient" style={{ backgroundColor: '#1a1a1a' }}>Patient</option>
                  </select>
                </div>
              )}

              {/* Password */}
              <div style={{ transition: 'all 300ms' }}>
                <label style={{ color: '#B8B8B8', display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#8B8B8B' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '3.5rem',
                      paddingTop: '0.875rem',
                      paddingBottom: '0.875rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '0.75rem',
                      color: 'white',
                      transition: 'all 300ms',
                      outline: 'none'
                    }}
                    placeholder="Enter your password"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4A574';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 116, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8B8B8B',
                      transition: 'all 300ms',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#D4A574';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#8B8B8B';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password - Only for signup */}
              {!isLogin && (
                <div style={{ transition: 'all 300ms', animation: 'slideIn 0.3s ease-out' }}>
                  <label style={{ color: '#B8B8B8', display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#8B8B8B' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        paddingLeft: '3rem',
                        paddingRight: '1rem',
                        paddingTop: '0.875rem',
                        paddingBottom: '0.875rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '0.75rem',
                        color: 'white',
                        transition: 'all 300ms',
                        outline: 'none'
                      }}
                      placeholder="Confirm your password"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#D4A574';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 116, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2a2a2a';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Role selector while logging in */}
              {isLogin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <div style={{ color: '#B8B8B8', fontSize: '0.875rem', fontWeight: 500 }}>Sign in as</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {[
                      { role: 'receptionist', label: 'Receptionist' },
                      { role: 'opd', label: 'OPD' },
                      { role: 'doctor', label: 'Doctor' },
                      { role: 'patient', label: 'Patient' }
                    ].map(({ role, label }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role })}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          transition: 'all 300ms',
                          cursor: 'pointer',
                          border: formData.role === role ? 'none' : '1px solid rgba(42, 42, 42, 0.5)',
                          background: formData.role === role ? 'linear-gradient(to bottom right, #D4A574, #C9955E)' : '#1a1a1a',
                          color: formData.role === role ? '#0a0a0a' : '#B8B8B8',
                          boxShadow: formData.role === role ? '0 10px 15px -3px rgba(212, 165, 116, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (formData.role !== role) {
                            e.currentTarget.style.backgroundColor = '#1a1a1a';
                          }
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <User style={{ width: '1.25rem', height: '1.25rem', margin: '0 auto 0.375rem' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, display: 'block' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'linear-gradient(to right, #D4A574, #C9955E)',
                  color: '#0a0a0a',
                  borderRadius: '0.75rem',
                  transition: 'all 300ms',
                  boxShadow: '0 10px 15px -3px rgba(212, 165, 116, 0.4)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #C9955E, #B8935E)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(212, 165, 116, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #D4A574, #C9955E)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(212, 165, 116, 0.4)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
              >
                {isLogin ? (
                  <>
                    <LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle Login/Signup */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#B8B8B8', fontSize: '0.875rem' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  style={{
                    color: '#D4A574',
                    transition: 'color 300ms',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C9955E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#D4A574';
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6B6B6B', fontSize: '0.75rem' }}>
              © 2025 Ophthalmology EMR System. All rights reserved.
            </p>
            
            {/* SaaS Options */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(107, 107, 107, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: '#8B8B8B', fontSize: '0.875rem', fontWeight: 500 }}>Hospital & Organization Management</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onNavigate?.('payment-setup')}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#1a1a1a',
                    color: '#D4A574',
                    border: '1px solid #2a2a2a',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#D4A574';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#2a2a2a';
                  }}
                >
                  <CreditCard style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Create Hospital</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onNavigate?.('organization-login')}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#1a1a1a',
                    color: '#D4A574',
                    border: '1px solid #2a2a2a',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#D4A574';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#2a2a2a';
                  }}
                >
                  <Building2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Hospital Staff</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onNavigate?.('admin-dashboard')}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#1a1a1a',
                    color: '#D4A574',
                    border: '1px solid #2a2a2a',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 300ms',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#D4A574';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#2a2a2a';
                  }}
                >
                  <BarChart3 style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1024px) {
          .animation-container {
            display: none !important;
          }
          .main-container {
            justify-content: center !important;
          }
          .form-container {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}