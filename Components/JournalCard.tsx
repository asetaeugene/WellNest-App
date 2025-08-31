import React from 'react';
import { motion } from 'framer-motion';
import { JournalEntry, Emotion } from '../types';

const EmotionBar: React.FC<{ emotion: Emotion }> = ({ emotion }) => {
    const emotionColor = (score: number) => {
        if (score > 75) return 'bg-green-500';
        if (score > 50) return 'bg-yellow-400';
        if (score > 25) return 'bg-orange-400';
        return 'bg-red-400';
    }

    return (
        <div className="flex items-center space-x-2">
            <span className="w-24 text-sm font-medium text-text-secondary dark:text-dark-text-secondary capitalize truncate">{emotion.emotion}</span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${emotionColor(emotion.score)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${emotion.score}%` }}></div>
            </div>
            <span className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{emotion.score}%</span>
        </div>
    )
};

const JournalCard: React.FC<{ entry: JournalEntry }> = React.memo(({ entry }) => {
  const { date, content, analysis } = entry;
  // Use real premium check from user context
  // Assumes useAuth provides user object with isPremium property
  // If not, adjust according to your actual user context implementation
  // import { useAuth } from '../context/AuthContext'; (add at top if not present)
  // const { user } = useAuth();
  // const isPremium = user?.isPremium;
  let isPremium = false;
  try {
    // Dynamically require useAuth if not already imported
    // (If already imported, just use it directly)
    // @ts-ignore
    const { useAuth } = require('../context/AuthContext');
    const { user } = useAuth();
    isPremium = !!user?.isPremium;
  } catch (e) {
    // fallback: not premium
    isPremium = false;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  interface PremiumCardProps {
    onUpgrade?: () => void;
  }
  const PremiumCard: React.FC<PremiumCardProps> = ({ onUpgrade }) => (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6 max-w-md mx-auto mt-8">
      <div className="flex flex-col items-center">
        <div className="relative w-full flex justify-center mb-2">
          <span className="absolute -top-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow">Most Popular</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-xl">★</span>
          <span className="font-bold text-2xl">Premium</span>
        </div>
        <div className="text-gray-500 text-center mb-2">Advanced features for deeper mental wellness insights</div>
        <div className="text-4xl font-bold text-brand-primary mb-1">$2.99 <span className="text-base font-normal text-gray-400">/month</span></div>
        <div className="text-gray-400 line-through text-sm">$4.99</div>
        <div className="text-green-600 text-sm mb-2">40% off</div>
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 mb-4 w-full text-center">
          <span className="font-semibold">💡 Annual Plan: $24.99/year (30% discount)</span><br />
          <span className="text-gray-500">Regional pricing available for African markets: $1.99/month</span>
        </div>
  {isPremium ? (
          <ul className="text-left space-y-2 mb-6">
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Everything in Free</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Unlimited habits</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Advanced analytics & insights</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Guided meditation library</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Export & backup data</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Professional integrations</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Priority support</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Custom themes</li>
            <li className="flex items-center gap-2 text-green-600"><span>✓</span> Advanced AI insights</li>
          </ul>
        ) : (
          <div className="mb-6 w-full">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-center text-sm mb-2">
              Unlock all features by upgrading to Premium!
            </div>
            <button
              className="w-full py-3 rounded-lg bg-brand-primary text-white font-semibold text-lg shadow hover:bg-brand-dark transition-colors"
              onClick={onUpgrade}
            >
              👑 Upgrade to Premium
            </button>
          </div>
        )}
        <div className="text-xs text-gray-500 text-center">
          7-day <a href="#" className="underline">free trial</a> · <a href="#" className="underline">Cancel anytime</a>
        </div>
      </div>
    </div>
  );

  // Example usage: pass a handler to open payment modal or redirect
  // <PremiumCard onUpgrade={() => setShowPaymentModal(true)} />
  return (
    <motion.div 
      className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.08)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-primary">{formatDate(date)}</h3>
        {analysis && (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                analysis.overallSentiment === 'Positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                analysis.overallSentiment === 'Negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
            }`}>
                {analysis.overallSentiment}
            </span>
        )}
      </div>
      <p className="text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-6 whitespace-pre-wrap">{content}</p>
      
      {analysis && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-4">
          <p className="italic text-text-secondary dark:text-dark-text-secondary text-center mb-4">"{analysis.summary}"</p>
          <div className="space-y-3">
              {analysis.emotions.slice(0, 3).map(emo => <EmotionBar key={emo.emotion} emotion={emo} />)}
          </div>
          {analysis.affirmation && (
            <div className="mt-5 p-4 bg-brand-light dark:bg-dark-border rounded-lg flex items-center space-x-3 border-l-4 border-brand-primary">
                <i className="fas fa-lightbulb-on text-2xl text-yellow-400"></i>
                <div>
                  <h4 className="font-bold text-brand-dark dark:text-dark-text-primary">A Thought For You</h4>
                  <p className="text-sm font-medium text-brand-dark dark:text-dark-text-secondary opacity-90">{analysis.affirmation}</p>
                </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default JournalCard;