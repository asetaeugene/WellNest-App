import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useJournal } from '../context/JournalContext';
import Spinner from '../components/Spinner';
import MoodChart from '../components/MoodChart';
import { useTheme } from '../context/ThemeContext';


declare var jspdf: any;
declare var html2canvas: any;

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-medium text-text-primary dark:text-dark-text-primary">Appearance</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary">Switch between light and dark themes.</p>
            </div>
            <div 
                onClick={toggleTheme} 
                className={`flex items-center h-8 w-14 p-1 rounded-full cursor-pointer transition-colors ${theme === 'dark' ? 'bg-brand-primary justify-end' : 'bg-gray-300 justify-start'}`}
            >
                <span className="sr-only">Toggle Theme</span>
                <motion.span
                    className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                >
                    {theme === 'dark' ? <i className="fas fa-moon text-brand-primary"></i> : <i className="fas fa-sun text-yellow-500"></i>}
                </motion.span>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { openModal } = useModal();
    const { user } = useAuth();
    const { entries } = useJournal();
    const [isExporting, setIsExporting] = useState(false);

    const handleRawExport = async () => {
        setIsExporting(true);
        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = '595px'; // A4 width in points
        
        let content = `
            <div style="font-family: sans-serif; color: #333; padding: 20px;">
                <h1 style="font-size: 24px;">WellNest Journal Export</h1>
                <p style="font-size: 12px; color: #666;">User: ${user?.name} (${user?.email})</p>
                <p style="font-size: 12px; color: #666;">Export Date: ${new Date().toLocaleDateString()}</p>
                <hr style="margin: 20px 0;" />
        `;
        
        entries.forEach(entry => {
            content += `
                <div style="margin-bottom: 20px; page-break-inside: avoid;">
                    <h2 style="font-size: 16px; font-weight: bold;">${new Date(entry.date).toLocaleString()}</h2>
                    <p style="white-space: pre-wrap; margin-top: 5px; font-size: 12px;">${entry.content}</p>
                    ${entry.analysis ? `
                        <div style="background-color: #f3f4f6; padding: 10px; margin-top: 10px;">
                           <p style="font-style: italic; font-size: 12px;"><strong>Summary:</strong> "${entry.analysis.summary}"</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        content += '</div>';
        pdfContainer.innerHTML = content;
        document.body.appendChild(pdfContainer);

        await html2canvas(pdfContainer, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`WellNest_Journal_Export_${new Date().toISOString().split('T')[0]}.pdf`);
        });

        document.body.removeChild(pdfContainer);
        setIsExporting(false);
    };

    const handleVisualExport = async () => {
        if (!user?.isPremium) return;
        setIsExporting(true);

        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');

        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = '595px';
        document.body.appendChild(pdfContainer);

        const PdfReport: React.FC = () => (
             <div style={{ fontFamily: 'sans-serif', color: '#333', padding: '20px', width: '595px', backgroundColor: 'white' }}>
                <h1 style={{ fontSize: '24px', color: '#065F46', borderBottom: '2px solid #34D399', paddingBottom: '10px' }}>WellNest Visual Report</h1>
                <p style={{ fontSize: '12px', color: '#666' }}>User: ${user?.name} (${user?.email})</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Export Date: ${new Date().toLocaleDateString()}</p>
                <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
                <h2 style={{ fontSize: '18px', color: '#065F46', marginBottom: '10px' }}>Mood Over Time</h2>
                <div style={{ height: '300px', marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                    <MoodChart entries={entries} />
                </div>
                 <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
                <h2 style={{ fontSize: '18px', color: '#065F46', marginBottom: '10px' }}>Journal Entries</h2>
                 {entries.map(entry => (
                     <div key={entry.id} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                         <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#065F46' }}>{new Date(entry.date).toLocaleString()}</h3>
                         <p style={{ whiteSpace: 'pre-wrap', marginTop: '5px', fontSize: '12px', lineHeight: '1.6' }}>{entry.content}</p>
                         {entry.analysis && (
                             <div style={{ backgroundColor: '#ECFDF5', borderLeft: '3px solid #34D399', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
                                <p style={{ fontStyle: 'italic', fontSize: '12px', marginBottom: '5px' }}><strong>Sentiment:</strong> {entry.analysis.overallSentiment}</p>
                                <p style={{ fontStyle: 'italic', fontSize: '12px' }}><strong>Summary:</strong> "{entry.analysis.summary}"</p>
                             </div>
                         )}
                     </div>
                 ))}
             </div>
        );
        const root = createRoot(pdfContainer);
        root.render(<PdfReport />);
        
        await new Promise(res => setTimeout(res, 2000)); // Wait for chart animation

        await html2canvas(pdfContainer, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`WellNest_Visual_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        });

        root.unmount();
        document.body.removeChild(pdfContainer);
        setIsExporting(false);
    };


    return (
    <motion.div 
        className="max-w-4xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">Settings</h1>
            <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-2">Manage your account and preferences.</p>
        </header>

        <div className="space-y-12">
            {/* Account Section */}
            <section>
            <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary border-b dark:border-dark-border pb-2 mb-4">Account</h2>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border space-y-4">
                <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Name</label>
                <input type="text" value={user?.name} disabled className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2" />
                </div>
                <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Email</label>
                <input type="email" value={user?.email} disabled className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2" />
                </div>
                <motion.button 
                  onClick={() => openModal('editProfile')} 
                  data-tour="edit-profile-button"
                  className="px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-dark transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Profile
                </motion.button>
            </div>
            </section>
            
            {/* Theme Section */}
            <section>
                <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary border-b dark:border-dark-border pb-2 mb-4">Theme</h2>
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border">
                    <ThemeToggle />
                </div>
            </section>

            {/* Premium Section */}
            <section>
            <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary border-b dark:border-dark-border pb-2 mb-4">WellNest Premium</h2>
            <div className="bg-gradient-to-r from-brand-dark to-brand-primary p-8 rounded-xl shadow-lg text-white text-center overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-white/10 rounded-full"></div>
                <h3 className="text-3xl font-bold">Unlock Your Full Potential</h3>
                <p className="mt-2 text-lg opacity-90">Get deeper insights, unlimited history, and more.</p>
                <ul className="mt-6 space-y-2 text-left inline-block">
                    <li className="flex items-center"><i className="fas fa-check-circle mr-3"></i> Detailed Trend Reports</li>
                    <li className="flex items-center"><i className="fas fa-check-circle mr-3"></i> Unlimited Journal History</li>
                    <li className="flex items-center"><i className="fas fa-check-circle mr-3"></i> Personalized Mood-Based Tips</li>
                    <li className="flex items-center"><i className="fas fa-check-circle mr-3"></i> Export Journal with Graphs</li>
                </ul>
                <div className="mt-8">
                    <motion.button 
                        onClick={() => openModal('intaSend')}
                        className="px-10 py-4 bg-white text-brand-dark font-bold text-lg rounded-lg shadow-xl"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        Upgrade to Premium
                    </motion.button>
                </div>
            </div>
            </section>
            
            {/* Data Management Section */}
            <section>
            <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary border-b dark:border-dark-border pb-2 mb-4">Data & Feedback</h2>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className='mb-4 sm:mb-0'>
                        <h3 className="font-medium text-text-primary dark:text-dark-text-primary">Export Your Data</h3>
                        <p className="text-text-secondary dark:text-dark-text-secondary">Download all your journal entries in a PDF file.</p>
                    </div>
                    <motion.button 
                        onClick={() => openModal('export', { handleRawExport, handleVisualExport })} 
                        disabled={isExporting} 
                        data-tour="export-data-button"
                        className="w-full sm:w-36 flex justify-center px-5 py-2 border border-gray-300 dark:border-dark-border text-base font-medium rounded-md text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                    >
                        {isExporting ? <Spinner size="5" /> : 'Export Data'}
                    </motion.button>
                </div>
                <hr className="my-4 dark:border-dark-border"/>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                     <div className='mb-4 sm:mb-0'>
                        <h3 className="font-medium text-text-primary dark:text-dark-text-primary">Have Feedback?</h3>
                        <p className="text-text-secondary dark:text-dark-text-secondary">We'd love to hear your thoughts on WellNest.</p>
                    </div>
                    <motion.button 
                        onClick={() => openModal('feedback')} 
                        className="w-full sm:w-auto px-5 py-2 border border-gray-300 dark:border-dark-border text-base font-medium rounded-md text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Give Feedback
                    </motion.button>
                </div>
            </div>
            </section>
        </div>
        </motion.div>
  );
};

export default SettingsPage;