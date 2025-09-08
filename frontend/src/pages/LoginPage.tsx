import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';

export default function LoginPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const [authToken, setAuthToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    if (!authToken.trim()) {
      setError(t('required-token'));
      setIsLoading(false);
      return;
    }

    const result = await authApi.login(authToken);
    if (!result.success) {
      setError(result.error || t('unknown-error'));
    }
    navigate({ to: '/' });
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800/90">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-3xl dark:text-white">LLM Hooks</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="auth-token"
              className="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300"
            >
              {t('auth-token')}
            </label>
            <div className="relative">
              <PasswordInput
                id="auth-token"
                value={authToken}
                placeholder={t('auth-token-placeholder')}
                onChange={(e) => setAuthToken(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            size="medium"
            variant="primary"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('logging-in') : t('login')}
          </Button>
        </div>
      </div>
    </div>
  );
}
