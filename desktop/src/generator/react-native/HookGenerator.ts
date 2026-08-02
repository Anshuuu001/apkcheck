import type { AppBlueprint } from '../../blueprint/schema';

export class HookGenerator {
  static generate(_blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};

    files['src/hooks/useAuth.ts'] = `import { useAppStore } from '../store/useAppStore';

export function useAuth() {
  const user = useAppStore(state => state.user);
  const token = useAppStore(state => state.token);
  const login = useAppStore(state => state.login);
  const logout = useAppStore(state => state.logout);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout
  };
}`;

    files['src/hooks/useApi.ts'] = `import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export function useApi(method: string, path: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (body?: any, queryParams?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.request({ method, path, body, queryParams });
      setData(response);
      return response;
    } catch (e: any) {
      setError(e.message || 'API request failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [method, path]);

  return { data, loading, error, execute };
}`;

    return files;
  }
}
