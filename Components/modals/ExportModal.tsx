import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface ExportModalProps {
    onClose: () => void;
    handleRawExport: () => void;
    handleVisualExport: () => void;
}

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
};

const ExportModal: React.FC<ExportModalProps> = ({ onClose, handleRawExport, handleVisualExport }) => {
    const { user } = useAuth();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <AnimatePresence>
            <motion.div 
                className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 max-w-lg w-full m-4"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Choose Export Format</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Select the format for your journal export. Visual reports are a premium feature.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Raw Text Export */}
                    <button 
                        onClick={() => { handleRawExport(); onClose(); }}
                        className="p-6 border-2 border-gray-300 dark:border-dark-border rounded-lg text-left hover:border-brand-primary hover:bg-brand-light dark:hover:bg-dark-border transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <i className="fas fa-file-alt text-3xl text-brand-primary mb-3"></i>
                            <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">Raw Text Export</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1">A simple document of all your entries and their AI summaries.</p>
                        </div>
                        <span className="text-sm font-semibold text-brand-dark dark:text-brand-primary mt-4">Available for all users</span>
                    </button>

                    {/* Visual Export */}
                    <div className="relative">
                         {!user?.isPremium && (
                            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10 transform -rotate-12 shadow-md">PREMIUM</div>
                         )}
                        <button 
                            onClick={() => { if(user?.isPremium) { handleVisualExport(); onClose(); } }}
                            disabled={!user?.isPremium}
                            className="p-6 border-2 border-gray-300 dark:border-dark-border rounded-lg text-left transition-all duration-300 w-full h-full disabled:opacity-60 disabled:cursor-not-allowed enabled:hover:border-brand-primary enabled:hover:bg-brand-light dark:enabled:hover:bg-dark-border flex flex-col justify-between"
                        >
                            <div>
                                <i className="fas fa-chart-pie text-3xl text-brand-primary mb-3"></i>
                                <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">Visual Report</h3>
                                <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1">A beautiful PDF including your mood chart and formatted entries.</p>
                            </div>
                            <span className={`text-sm font-semibold mt-4 ${user?.isPremium ? 'text-brand-dark dark:text-brand-primary' : 'text-gray-500 dark:text-dark-text-secondary'}`}>
                                {user?.isPremium ? 'Available Now' : 'Requires Premium'}
                            </span>
                        </button>
                    </div>
                </div>

            </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ExportModal;