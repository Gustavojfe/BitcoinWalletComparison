import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Update position when hovering
  const updateTooltipPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 10 // 10px offset from the right edge
      });
    }
  };
  
  // Update position on mount and window resize
  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    return () => window.removeEventListener('resize', updateTooltipPosition);
  }, []);

  return (
    <div className="tooltip-container" onMouseEnter={updateTooltipPosition}>
      <div className="tooltip-trigger" ref={triggerRef}>
        {children}
      </div>
      <div 
        className="tooltip-popup" 
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px` 
        }}
      >
        <h3 className="tooltip-title">{title}</h3>
        <p className="tooltip-description">{description}</p>
      </div>
    </div>
  );
};

export default WalletTooltip;
