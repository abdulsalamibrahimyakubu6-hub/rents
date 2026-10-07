import React, { useState } from 'react';
import { Modal } from './Modal';
import { authApi, setToken } from '../../lib/api';
import { AlertBanner } from './AlertBanner';
import { Lock, User, Mail } from 'lucide-react';
import { User as UserType } from '../../lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('admin_landlord');
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const tokens = await authApi.login(username, password);
        setToken(tokens.access);
        const me = await authApi.getMe();
        setSuccessMsg('Authentication successful!');
        setTimeout(() => {
          onAuthSuccess(me);
          onClose();
        }, 500);
      } else {
        await authApi.register({ username, email, password, role });
        setSuccessMsg('Registration successful! Please sign in with your credentials.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'DRF API Authentication' : 'Create API User Account'}
      subtitle="Connect to https://rent-api-xjs4.onrender.com/ via Bearer Token JWT"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}
        {successMsg && <AlertBanner type="success" message={successMsg} />}

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Obtain JWT Token (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register New Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin_landlord"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">User Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      role === 'landlord'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Landlord / Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tenant')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      role === 'tenant'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Tenant
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition-all disabled:opacity-50"
            >
              {loading
                ? 'Processing Authentication...'
                : mode === 'login'
                ? 'Authenticate & Save JWT Token'
                : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
