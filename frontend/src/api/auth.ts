import { logger } from '../utils/logger.ts';
import { API_TIMEOUT_MS } from './index.ts';

const authApiBase = '/auth';
const moduleLogger = logger.moduleLogger('auth-api');

type LoginResponse = {
  error?: string;
};

export const authApi = {
  async login(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${authApiBase}/login`, {
        method: 'POST',
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: LoginResponse = await response.json();
        return {
          success: false,
          error: errorData.error || response.statusText,
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${authApiBase}/logout`, {
        method: 'POST',
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        credentials: 'include',
      });
    } catch (error) {
      // ignore the error since we have already cleared the local state
      moduleLogger.warn(`Logout API call failed: ${String(error)}.`);
    }
  },
};
