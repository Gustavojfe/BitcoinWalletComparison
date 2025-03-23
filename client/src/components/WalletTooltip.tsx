import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 15 // add offset from the element
      });
      setShowTooltip(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Tooltip component that will be portaled to the document body
  const Tooltip = () => {
    if (!showTooltip) return null;
    
    return createPortal(
      <div 
        className="fixed bg-gray-900 text-white p-4 rounded-md shadow-lg z-[9999] w-80"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`
        }}
      >
        <h3 className="font-medium text-sm mb-2">{title}</h3>
        <p className="text-xs text-gray-200 whitespace-normal break-words">{description}</p>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      <Tooltip />
    </>
  );
};

export default WalletTooltip;
