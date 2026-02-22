import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { t } from '../lib/i18n';

interface AuthProps {
  language: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ language, onLogin, onRegister, onResetPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const lang = language as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);
    setLoading(true);

    try {
      if (isForgotPassword) {
        await onResetPassword(email);
        setResetSuccess(true);
        setEmail('');
      } else if (isLogin) {
        await onLogin(email, password);
      } else {
        // Check if passwords match
        if (password !== confirmPassword) {
          setError(t('passwordMismatch', lang));
          setLoading(false);
          return;
        }
        await onRegister(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || t('error', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 dark:from-blue-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-2xl flex items-center justify-center text-white">
              <Car size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            {isForgotPassword ? t('forgotPasswordTitle', lang) : isLogin ? t('welcome', lang) : t('registerTitle', lang)}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {isForgotPassword ? t('forgotPasswordDesc', lang) : isLogin ? t('loginDesc', lang) : t('registerDesc', lang)}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {t('resetEmailSent', lang)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <input
                type="text"
                placeholder={t('registerNamePlaceholder', lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
            <input
              type="email"
              placeholder={t('loginEmailPlaceholder', lang)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {!isForgotPassword && (
              <>
                <input
                  type="password"
                  placeholder={isLogin ? t('loginPasswordPlaceholder', lang) : t('registerPasswordPlaceholder', lang)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {!isLogin && (
                  <input
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder', lang)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? '...' : isForgotPassword ? t('resetEmail', lang) : isLogin ? t('loginBtn', lang) : t('registerNow', lang)}
            </button>
          </form>

          {isLogin && !isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setResetSuccess(false);
                }}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                {t('forgotPassword', lang)}
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmail('');
                  setError('');
                  setResetSuccess(false);
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                {t('backToLogin', lang)}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            {!isForgotPassword && (
              <p className="text-gray-600 text-sm">
                {isLogin ? t('noAccount', lang) : t('haveAccount', lang)}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setConfirmPassword('');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {isLogin ? t('registerNow', lang) : t('loginBtn', lang)}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
