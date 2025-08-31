
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = '8' }) => {
  return (
    <div className={`w-${size} h-${size} border-4 border-brand-secondary border-t-brand-primary rounded-full animate-spin`}></div>
  );
};

export default Spinner;
