import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getToken, setToken, removeToken, apiRequest } from '../lib/auth';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await apiRequest('GET', '/auth/user');
    },
    enabled: !!getToken(),
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      setIsAuthenticated(true);
      setUser(userData);
    } else if (!getToken()) {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [userData]);

  return {
    isAuthenticated,
    isLoading,
    user,
    setToken,
    removeToken,
  };
};
