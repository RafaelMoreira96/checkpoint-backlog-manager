import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto, RegisterPlayerDto, UpdatePlayerDto } from '@checkpoint/core';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterPlayerDto) => Promise<void>;
  updateProfile: (dto: UpdatePlayerDto) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const queryClient = useQueryClient();

  // Load existing session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await api.getToken();
        if (token) {
          const profile = await api.getProfile();
          setUser(profile);
        }
      } catch (err) {
        // Invalid or expired token
        await api.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const openLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (dto: LoginDto) => {
    await api.login(dto);
    const profile = await api.getProfile();
    setUser(profile);
    setIsAuthModalOpen(false);
    queryClient.invalidateQueries();
  };

  const register = async (dto: RegisterPlayerDto) => {
    await api.registerPlayer(dto);
    // Automatically log in after registration
    await login({ nickname: dto.nickname, password: dto.password });
  };

  const updateProfile = async (dto: UpdatePlayerDto): Promise<User> => {
    await api.updateProfile(dto);
    const profile = await api.getProfile();
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await api.clearToken();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openLogin,
        openRegister,
        closeAuthModal,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
