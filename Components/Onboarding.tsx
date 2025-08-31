import React, { useEffect, useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useLocation, useNavigate } from 'react-router-dom';

const tourSteps = [
  {
    target: '[data-tour="journal-input"]',
    content: "Welcome to WellNest! This is where you can write down your thoughts and feelings each day.",
    path: '/journal'
  },
  {
    target: '[data-tour="journal-button"]',
    content: 'After writing, click here to get an AI-powered analysis of your mood and emotions.',
    path: '/journal'
  },
  {
    target: '[data-tour="insights-nav"]',
    content: "Next, let's check out the Insights tab to see your emotional trends over time.",
    path: '/journal'
  },
  {
    target: '[data-tour="mood-chart"]',
    content: "Here's your Mood Chart. As you add more entries, you'll see your emotional journey visualized here.",
    path: '/insights'
  },
  {
    target: '[data-tour="common-emotions"]',
    content: "This section highlights the emotions that appear most frequently in your journal entries.",
    path: '/insights'
  },
  {
    target: '[data-tour="quotes-nav"]',
    content: "Need a bit of inspiration? Head over to the Daily Quotes section.",
    path: '/insights'
  },
  {
    target: '[data-tour="quote-card"]',
    content: "Here you'll find a new motivational quote each day to brighten your perspective.",
    path: '/quotes'
  },
  {
    target: '[data-tour="settings-nav"]',
    content: "Finally, let's look at Settings, where you can manage your account and data.",
    path: '/quotes'
  },
  {
    target: '[data-tour="edit-profile-button"]',
    content: "You can update your name and profile picture here to personalize your experience.",
    path: '/settings'
  },
    {
    target: '[data-tour="export-data-button"]',
    content: "And whenever you need to, you can export your entire journal as a PDF right from here.",
    path: '/settings'
  }
];

const Onboarding: React.FC = () => {
  const { isTourActive, tourStep, nextStep, endTour } = useOnboarding();
  const [position, setPosition] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isTourActive) {
      setPosition(null);
      return;
    }

    const currentStep = tourSteps[tourStep];
    if (!currentStep) {
      endTour();
      return;
    }

    // If we are not on the right page, navigate there.
    // The effect will re-run once the location changes.
    if (location.pathname !== currentStep.path) {
      navigate(currentStep.path);
      setPosition(null); // Hide tooltip during navigation
      return;
    }

    // We are on the correct path. Now, poll for the element.
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3 seconds timeout
    const intervalId = setInterval(() => {
      const element = document.querySelector(currentStep.target);
      
      if (element) {
        clearInterval(intervalId);
        
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });

        // --- Intelligent Tooltip Positioning ---
        const style: React.CSSProperties = {};
        const isNavTarget = currentStep.target.includes('-nav');
        const tooltipWidth = 320; // Corresponds to max-w-xs
        const space = 15; // Space from the highlighted element

        // For sidebar nav items on desktop
        if (isNavTarget && rect.left < 256 && window.innerWidth >= 768) { 
            style.top = rect.top;
            style.left = rect.right + space;
        } 
        // Default position: below the element, if there's enough space
        else if (rect.bottom < window.innerHeight - 150) { 
             style.top = rect.bottom + space;
             let leftPos = rect.left + rect.width / 2 - tooltipWidth / 2;
             if (leftPos < 10) leftPos = 10;
             if (leftPos + tooltipWidth > window.innerWidth) leftPos = window.innerWidth - (tooltipWidth + 10);
             style.left = leftPos;
        }
        // Fallback position: above the element
        else {
            style.bottom = window.innerHeight - rect.top + space;
            let leftPos = rect.left + rect.width / 2 - tooltipWidth / 2;
            if (leftPos < 10) leftPos = 10;
            if (leftPos + tooltipWidth > window.innerWidth) leftPos = window.innerWidth - (tooltipWidth + 10);
            style.left = leftPos;
        }
        setTooltipStyle(style);
        
      } else {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(intervalId);
          console.warn(`Onboarding tour target "${currentStep.target}" not found on path "${location.pathname}" after ${maxAttempts * 100}ms. Ending tour as a failsafe.`);
          endTour();
        }
      }
    }, 100);

    return () => clearInterval(intervalId);

  }, [isTourActive, tourStep, location.pathname, navigate, endTour]);

  if (!isTourActive || !position) return null;

  const currentStep = tourSteps[tourStep];
  const isLastStep = tourStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      endTour();
      // Navigate back to the main journal page after the tour ends
      if (location.pathname !== '/journal') {
        navigate('/journal');
      }
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="fixed inset-0 bg-black bg-opacity-70 animate-fade-in-fast" onClick={endTour}></div>

      <div
        className="absolute bg-transparent border-4 border-dashed border-white rounded-lg shadow-2xl transition-all duration-300 pointer-events-none"
        style={{
          top: position.top - 10,
          left: position.left - 10,
          width: position.width + 20,
          height: position.height + 20,
        }}
      ></div>

      <div
        className="absolute bg-white dark:bg-dark-surface rounded-lg p-4 w-full max-w-xs shadow-2xl animate-fade-in-scale z-10"
        style={tooltipStyle}
      >
        <p className="text-text-primary dark:text-dark-text-primary mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{tourStep + 1} / {tourSteps.length}</span>
          <div className="space-x-2">
             <button
                onClick={endTour}
                className="px-3 py-1 text-sm text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border rounded-md"
              >
                Skip
              </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-dark transition-colors"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;