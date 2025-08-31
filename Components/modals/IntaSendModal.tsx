import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { apiInitiatePayment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ToastProvider';
import Spinner from '../Spinner';

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
};

const IntaSendModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!token) {
            addToast("You must be logged in to make a payment.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const { checkout_url } = await apiInitiatePayment(token);
            // In a real application, we redirect the user to the IntaSend checkout page
            window.location.href = checkout_url;
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to initiate payment.", "error");
            setIsLoading(false);
        }
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
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Upgrade to Premium</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">You're about to be securely redirected to complete your purchase.</p>
                <div className="bg-brand-light dark:bg-dark-border border border-brand-secondary dark:border-gray-600 p-4 rounded-lg text-center">
                    <p className="font-semibold text-brand-dark dark:text-dark-text-primary text-lg">WellNest Premium</p>
                    <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary my-2">$4.99 / Month</p>
                </div>
                <div className="mt-6">
                    <button 
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:bg-blue-400"
                    >
                        {isLoading ? (
                            <Spinner size="6" />
                        ) : (
                            <>
                                <img src="https://intasend-prod-static.s3.amazonaws.com/img/branding/intasend_logo_white.png" alt="IntaSend" className="h-6 mr-3"/>
                                Pay Securely
                            </>
                        )}
                    </button>
                    <p className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">Powered by IntaSend</p>
                </div>
            </motion.div>
           </AnimatePresence>
        </div>
    );
}

export default IntaSendModal;