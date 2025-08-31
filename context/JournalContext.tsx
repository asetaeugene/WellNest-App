import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { JournalEntry } from '../types';
import { analyzeJournalEntry } from '../services/geminiService';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ToastProvider';
import { apiGetJournalEntries, apiAddJournalEntry } from '../services/api';

interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  addEntry: (content: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For adding entries
  const [isFetching, setIsFetching] = useState<boolean>(true); // For loading initial entries
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!token) {
        setEntries([]);
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      try {
        const userEntries = await apiGetJournalEntries(token);
        setEntries(userEntries);
      } catch (err) {
        addToast("Failed to fetch journal entries from the server.", "error");
      } finally {
        setIsFetching(false);
      }
    };

    fetchEntries();
  }, [user, token, addToast]);

  const addEntry = useCallback(async (content: string) => {
    if (!token) {
      addToast("You must be logged in to add an entry.", "error");
      return;
    }
    if (!content.trim()) {
        addToast("Journal entry cannot be empty.", "error");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get analysis from our secure backend
      const analysis = await analyzeJournalEntry(content, token);

      // 2. Save the entry and analysis to our database via the backend
      const newEntry = await apiAddJournalEntry(token, content, analysis);
      
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      addToast("Journal entry analyzed and saved!", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, addToast]);

  return (
    <JournalContext.Provider value={{ entries, isLoading, isFetching, error, addEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};