import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface OnboardingContextType {
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextStep: () => void;
  endTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_COMPLETED_KEY = 'wellnest_onboarding_completed';

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const startTour = useCallback(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!hasCompleted) {
      setIsTourActive(true);
      setTourStep(0);
    }
  }, []);

  const nextStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setTourStep(0);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  }, []);

  return (
    <OnboardingContext.Provider value={{ isTourActive, tourStep, startTour, nextStep, endTour }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};