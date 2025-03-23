import { useState } from 'react';

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)} 
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex cursor-help"
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute left-full ml-2 top-0 z-50 w-80 transform translate-y-[-25%]">
          <div className="bg-gray-900 text-white p-4 rounded-md shadow-lg">
            <h3 className="font-medium text-sm mb-2">{title}</h3>
            <p className="text-xs text-gray-200 whitespace-normal">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTooltip;
