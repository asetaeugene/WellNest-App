import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const quotes = [
    { quote: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { quote: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", author: "Winston Churchill" },
    { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { quote: "You learn more from failure than from success. Don’t let it stop you. Failure builds character.", author: "Unknown" },
    { quote: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
    { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" }
];

const QuotesPage: React.FC = () => {
    const [currentQuote, setCurrentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    const getNewQuote = () => {
        let newQuote;
        do {
            newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (newQuote.quote === currentQuote.quote);
        setCurrentQuote(newQuote);
    };

    return (
        <motion.div 
            className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
             <header className="mb-8">
                <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">Daily Motivation</h1>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-2">A moment of reflection and inspiration for your day.</p>
            </header>

            <motion.div 
                data-tour="quote-card" 
                className="bg-white dark:bg-dark-surface p-10 rounded-xl shadow-lg border border-gray-200 dark:border-dark-border w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={currentQuote.quote}
                whileHover={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.08)" }}
            >
                <i className="fas fa-quote-left text-5xl text-brand-primary opacity-50"></i>
                <blockquote className="my-6">
                    <p className="text-3xl font-serif text-text-primary dark:text-dark-text-primary leading-relaxed">"{currentQuote.quote}"</p>
                </blockquote>
                <cite className="block text-right text-xl font-medium text-brand-dark dark:text-brand-primary">- {currentQuote.author}</cite>
                <i className="fas fa-quote-right text-5xl text-brand-primary opacity-50 ml-auto block mt-4"></i>
            </motion.div>
            
            <motion.button
                onClick={getNewQuote}
                className="mt-10 px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                <i className="fas fa-sync-alt mr-2"></i>
                New Quote
            </motion.button>
        </motion.div>
    );
};

export default QuotesPage;