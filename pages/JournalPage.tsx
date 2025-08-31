import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import JournalCard from '../components/JournalCard';
import Spinner from '../components/Spinner';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const JournalSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border animate-pulse">
        <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
        </div>
    </div>
);


const JournalPage: React.FC = () => {
    const [newEntry, setNewEntry] = useState('');
    const [visibleCount, setVisibleCount] = useState(5);
    const containerRef = useRef<HTMLDivElement>(null);
    const { entries, isLoading, isFetching, error, addEntry } = useJournal();
    const { user } = useAuth();
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 100 && visibleCount < entries.length) {
                setVisibleCount(v => Math.min(v + 5, entries.length));
            }
        };
        const ref = containerRef.current;
        if (ref) {
            ref.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (ref) {
                ref.removeEventListener('scroll', handleScroll);
            }
        };
    }, [visibleCount, entries.length]);

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

    // Sanitize input before sending to backend
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sanitizedEntry = newEntry.replace(/<[^>]*>?/gm, '').trim(); // Remove HTML tags and trim
        if (sanitizedEntry) {
            addEntry(sanitizedEntry).then(() => {
                setNewEntry('');
            });
        }
    };

    // Memoize paginated journal card list for performance
    const paginatedEntries = useMemo(() => {
        return entries.slice(0, visibleCount);
    }, [entries, visibleCount]);

    return (
        <motion.div 
            className="max-w-4xl mx-auto"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <header className="mb-8 flex items-center space-x-4">
                 <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <span>{userInitial}</span>}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">Hello, {user?.name?.split(' ')[0] || 'User'}!</h1>
                    <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-1">Reflect on your day. Your thoughts are safe here.</p>
                </div>
            </header>

            <section className="mb-12">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg border border-gray-200 dark:border-dark-border">
                    <textarea
                        data-tour="journal-input"
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder="What's on your mind today?"
                        className="w-full h-32 p-4 bg-gray-50 dark:bg-dark-bg text-text-primary dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all duration-200 text-lg"
                        disabled={isLoading}
                    />
                    {error && <p className="text-red-400 mt-2">{error}</p>}
                    <div className="flex justify-end mt-4">
                        <motion.button
                            data-tour="journal-button"
                            type="submit"
                            disabled={isLoading || !newEntry.trim()}
                            className="flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="5" />
                                    <span className="ml-2">Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic mr-2"></i>
                                    <span>Analyze My Day</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary mb-6 pb-2 border-b-2 border-gray-200 dark:border-dark-border">Past Entries</h2>
                <div className="space-y-6">
                    {isFetching ? (
                        <>
                            <JournalSkeleton />
                            <JournalSkeleton />
                        </>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border">
                            <i className="fas fa-book-reader text-5xl text-gray-400 dark:text-gray-500"></i>
                            <p className="mt-4 text-text-secondary dark:text-dark-text-secondary text-lg">No entries yet. Write your first one above!</p>
                        </div>
                    ) : (
                        <>
                            <div ref={containerRef} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {paginatedEntries.map(entry => (
                                    <JournalCard key={entry.id} entry={entry} />
                                ))}
                                {entries.length > visibleCount && (
                                    <div className="flex justify-center items-center mt-8">
                                        <span className="text-gray-500">Loading more...</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default JournalPage;