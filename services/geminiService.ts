import { EmotionAnalysis } from '../types';
import { apiAnalyzeEntry } from './api';

export const analyzeJournalEntry = async (text: string, token: string): Promise<EmotionAnalysis> => {
  if (!text || text.trim() === '') {
    throw new Error("Cannot analyze an empty journal entry.");
  }
  
  try {
    const result = await apiAnalyzeEntry(text, token);
    return result;

  } catch (error) {
    console.error("Error analyzing journal entry via backend:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze entry: ${error.message}`);
    }
    throw new Error("Failed to analyze entry. The analysis service may be unavailable.");
  }
};