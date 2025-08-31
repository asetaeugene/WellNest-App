import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useToast } from '../ToastProvider';
import Spinner from '../Spinner';

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
};

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addToast } = useToast();
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(feedback.trim().length < 10) {
            addToast("Please provide a bit more detail in your feedback.", "error");
            return;
        }
        setIsLoading(true);
        // Simulate API call
        await new Promise(res => setTimeout(res, 1000));
        setIsLoading(false);
        addToast("Thank you for your feedback!", "success");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <AnimatePresence>
                <motion.div 
                    className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 max-w-md w-full m-4"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Share Your Feedback</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Your thoughts help us make WellNest better for everyone.</p>
                    
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what you think..."
                            className="w-full h-40 p-4 border-2 border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 text-lg bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end mt-6 space-x-3">
                            <motion.button 
                                type="button" 
                                onClick={onClose} 
                                className="px-6 py-2 border border-gray-300 dark:border-dark-border rounded-md text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button 
                                type="submit" 
                                disabled={isLoading || !feedback.trim()} 
                                className="w-32 flex justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:bg-gray-400"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLoading ? <Spinner size="5" /> : 'Submit'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FeedbackModal;