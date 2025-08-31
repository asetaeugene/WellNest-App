import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ToastProvider';
import Spinner from '../Spinner';

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
};

const EditProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [name, setName] = useState(user?.name || '');
    const [profilePic, setProfilePic] = useState<string | undefined>(user?.profilePicture);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                addToast("Image size should be less than 2MB.", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateUser({ name, profilePicture: profilePic });
        setIsLoading(false);
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Edit Your Profile</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="relative w-32 h-32">
                                <img 
                                    src={profilePic || `https://ui-avatars.com/api/?name=${name || user?.email}&background=34D399&color=fff&size=128`} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full object-cover shadow-md"
                                />
                                <motion.button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-dark transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <i className="fas fa-camera"></i>
                                </motion.button>
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Email</label>
                                <input 
                                    type="email" 
                                    value={user?.email}
                                    disabled
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-8 space-x-3">
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
                                disabled={isLoading} 
                                className="w-36 flex justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:bg-gray-400"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLoading ? <Spinner size="5" /> : 'Save Changes'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default EditProfileModal;