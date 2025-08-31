import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner';

const pageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const inputVariants = {
    rest: { scale: 1 },
    focus: { scale: 1.03, boxShadow: '0px 0px 8px rgba(52, 211, 153, 0.5)' }
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/journal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="text-center mb-8">
            <i className="fas fa-feather-alt text-brand-primary text-5xl"></i>
            <h1 className="text-3xl font-bold text-white mt-2">Welcome Back to WellNest</h1>
            <p className="text-gray-300">Sign in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <motion.input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"
                    variants={inputVariants}
                    initial="rest"
                    whileFocus="focus"
                    transition={{ type: 'spring', stiffness: 300 }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <motion.input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"
                    variants={inputVariants}
                    initial="rest"
                    whileFocus="focus"
                    transition={{ type: 'spring', stiffness: 300 }}
                />
            </div>
            <div>
                <motion.button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-500 transition-colors duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isLoading ? <Spinner size="6" /> : "Log In"}
                </motion.button>
            </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-secondary hover:underline">
                Sign Up
            </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;