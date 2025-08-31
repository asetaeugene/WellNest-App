import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import { User } from '../types';
import { apiLogin, apiSignup, apiGetUserFromToken, apiUpdateUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}

const SESSION_TOKEN_KEY = 'wellnest_session_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SESSION_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Check for saved user session on initial load
    const validateToken = async () => {
        if (token) {
            try {
                const userFromApi = await apiGetUserFromToken(token);
                if (userFromApi) {
                    setUser(userFromApi);
                } else {
                    // Token is invalid
                    setToken(null);
                    localStorage.removeItem(SESSION_TOKEN_KEY);
                }
            } catch (error) {
                console.error("Failed to validate token", error);
                setToken(null);
                localStorage.removeItem(SESSION_TOKEN_KEY);
            }
        }
        setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
        const { token: newToken, user: loggedInUser } = await apiLogin(email, pass);
        setUser(loggedInUser);
        setToken(newToken);
        localStorage.setItem(SESSION_TOKEN_KEY, newToken);
        addToast("Login successful! Welcome back.", "success");
        return true;
    } catch (error) {
        addToast(error instanceof Error ? error.message : "Login failed.", "error");
        return false;
    } finally {
        setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
        const { token: newToken, user: newUser } = await apiSignup(email, pass, name);
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem(SESSION_TOKEN_KEY, newToken);
        addToast("Account created successfully! Welcome to WellNest.", "success");
        return true;
    } catch (error) {
        addToast(error instanceof Error ? error.message : "Sign up failed.", "error");
        return false;
    } finally {
        setIsLoading(false);
    }
  }

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    addToast("You have been logged out.", "info");
  };
  
  const updateUser = async (updatedUserData: Partial<User>) => {
      if (!token) {
          addToast("You must be logged in to update your profile.", "error");
          return;
      };
      
      try {
        const updatedUser = await apiUpdateUser(token, updatedUserData);
        setUser(updatedUser);
        addToast("Profile updated successfully!", "success");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Profile update failed.", "error");
      }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};