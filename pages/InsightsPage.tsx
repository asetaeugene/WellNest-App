import React from 'react';
import { motion } from 'framer-motion';
import MoodChart from '../components/MoodChart';
import { useJournal } from '../context/JournalContext';
import { useModal } from '../context/ModalContext';
import { Emotion } from '../types';

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const EmotionCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mx-auto my-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>
);

const getEmotionEmoji = (emotion: string): string => {
    const lowerEmotion = emotion.toLowerCase();
    const map: { [key: string]: string } = {
        joy: '😊', happiness: '😊', optimism: '😊', happy: '😊',
        sadness: '😢', grief: '😢', sad: '😢',
        anger: '😠', frustration: '😠', angry: '😠',
        fear: '😨', anxiety: '😨', stress: '😨', worried: '😨',
        surprise: '😮', surprised: '😮',
        love: '❤️',
        calm: '😌', relaxed: '😌',
        contentment: '😌', peaceful: '😌',
    };
    for (const key in map) {
        if (lowerEmotion.includes(key)) return map[key];
    }
    return '🤔'; // Default
};


const InsightsPage: React.FC = () => {
    const { entries, isFetching } = useJournal();
    const { openModal } = useModal();
    
    const latestAffirmation = entries.find(e => e.analysis?.affirmation)?.analysis?.affirmation;

    const allEmotions = entries
        .flatMap(entry => entry.analysis?.emotions || [])
        .reduce((acc, emotion) => {
            const existing = acc.find(e => e.emotion.toLowerCase() === emotion.emotion.toLowerCase());
            if (existing) {
                existing.score += emotion.score;
                existing.count += 1;
            } else {
                acc.push({ ...emotion, count: 1 });
            }
            return acc;
        }, [] as (Emotion & {count: number})[])
        .map(e => ({...e, average: Math.round(e.score / e.count)}))
        .sort((a,b) => b.average - a.average)
        .slice(0, 5);

    return (
        <motion.div 
            className="max-w-6xl mx-auto"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">Your Emotional Insights</h1>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-2">Discover patterns and trends in your well-being journey.</p>
            </header>

            {isFetching ? (
                <div className="mb-8 bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md animate-pulse">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            ) : latestAffirmation && (
                 <section className="mb-12">
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border flex items-center space-x-4">
                         <i className="fas fa-lightbulb-on text-4xl text-yellow-400"></i>
                         <div>
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Today's Focus</h2>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1 text-lg">{latestAffirmation}</p>
                         </div>
                    </div>
                </section>
            )}

            <section className="mb-12" data-tour="mood-chart">
                <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Mood Over Time</h2>
                {isFetching ? (
                     <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-dark-surface rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-dark-border p-4 text-center animate-pulse">
                        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-56 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                     </div>
                ) : (
                    <MoodChart entries={entries} />
                )}
            </section>
            
            <section data-tour="common-emotions">
                <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Common Emotions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isFetching ? (
                        <>
                            <EmotionCardSkeleton />
                            <EmotionCardSkeleton />
                            <EmotionCardSkeleton />
                        </>
                    ) : allEmotions.length > 0 ? allEmotions.map(emo => (
                        <motion.div 
                            key={emo.emotion} 
                            className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border text-center"
                            whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)"}}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                             <h3 className="text-xl font-semibold text-brand-dark dark:text-brand-primary capitalize flex items-center justify-center space-x-2">
                                <span>{getEmotionEmoji(emo.emotion)}</span>
                                <span>{emo.emotion}</span>
                            </h3>
                            <p className="text-4xl font-bold text-text-primary dark:text-dark-text-primary my-2">{emo.average}%</p>
                            <p className="text-text-secondary dark:text-dark-text-secondary">Average Intensity</p>
                        </motion.div>
                    )) : (
                         !isFetching && <p className="text-text-secondary dark:text-dark-text-secondary col-span-full text-center py-10">No emotion data available yet. Keep journaling!</p>
                    )}
                     <motion.div 
                        className="bg-brand-light dark:bg-dark-surface p-6 rounded-xl border-2 border-dashed border-brand-primary dark:border-brand-primary flex flex-col items-center justify-center text-center group"
                        whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)"}}
                        transition={{ type: 'spring', stiffness: 300 }}
                     >
                        <i className="fas fa-sparkles text-brand-dark dark:text-brand-primary text-3xl mb-3 transition-transform duration-300 group-hover:scale-125"></i>
                        <h3 className="text-xl font-semibold text-brand-dark dark:text-dark-text-primary">Deeper Analysis</h3>
                        <p className="text-text-secondary dark:text-dark-text-secondary mt-1">Unlock weekly reports with WellNest Premium.</p>
                        <motion.button 
                            onClick={() => openModal('intaSend')}
                            className="mt-4 px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Upgrade Now
                        </motion.button>
                    </motion.div>
                </div>
            </section>

        </motion.div>
    );
};

export default InsightsPage;