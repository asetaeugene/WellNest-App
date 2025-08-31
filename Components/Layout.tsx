import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/journal', icon: 'fa-book-open', name: 'My Journal' },
  { path: '/insights', icon: 'fa-chart-line', name: 'Insights' },
  { path: '/quotes', icon: 'fa-quote-left', name: 'Daily Quotes' },
  { path: '/settings', icon: 'fa-cog', name: 'Settings' },
];

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

    return (
        <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex-col fixed h-full hidden md:flex">
            <div className="p-6 flex items-center space-x-3 border-b border-gray-200 dark:border-dark-border">
                <i className="fas fa-feather-alt text-brand-primary text-3xl"></i>
                <h1 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">WellNest</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        data-tour={
                            item.path === '/insights' ? 'insights-nav' :
                            item.path === '/quotes' ? 'quotes-nav' :
                            item.path === '/settings' ? 'settings-nav' : undefined
                        }
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-lg font-medium ${
                            isActive
                              ? 'bg-brand-light text-brand-dark dark:bg-brand-primary dark:text-white'
                              : 'text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-text-primary dark:hover:text-dark-text-primary'
                          }`
                        }
                    >
                        <i className={`fas ${item.icon} w-6 text-center`}></i>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                <div className="bg-brand-light dark:bg-dark-border p-4 rounded-lg text-left flex items-center space-x-3">
                     <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white text-xl font-bold">
                        {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <span>{userInitial}</span>}
                    </div>
                    <div>
                        <p className="text-brand-dark dark:text-dark-text-primary font-semibold truncate max-w-[120px]">{user?.name}</p>
                        <p className={`text-sm ${user?.isPremium ? 'text-yellow-600 font-bold' : 'text-gray-500 dark:text-dark-text-secondary'}`}>{user?.isPremium ? 'Premium Member' : 'Free Member'}</p>
                    </div>
                </div>
                 <button 
                    onClick={handleLogout} 
                    className="w-full text-left mt-4 py-3 px-4 text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all flex items-center font-semibold group"
                 >
                    <i className="fas fa-sign-out-alt w-6 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span className="ml-1">Logout</span>
                </button>
            </div>
        </aside>
    );
};

const BottomNav: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border flex justify-around z-10">
            {navItems.map(item => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    data-tour={
                        item.path === '/insights' ? 'insights-nav' :
                        item.path === '/quotes' ? 'quotes-nav' :
                        item.path === '/settings' ? 'settings-nav' : undefined
                    }
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center w-full py-2 text-sm transition-colors ${
                        isActive
                          ? 'text-brand-primary'
                          : 'text-text-secondary dark:text-dark-text-secondary hover:text-brand-primary'
                      }`
                    }
                >
                    <i className={`fas ${item.icon} text-xl mb-1`}></i>
                    <span>{item.name}</span>
                </NavLink>
            ))}
        </nav>
    );
};

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background dark:bg-dark-bg">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;