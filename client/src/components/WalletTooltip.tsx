import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = (e: React.MouseEvent) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + window.scrollX + 15,
        y: rect.top + window.scrollY + 15
      });
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  // Close tooltip when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // Make sure tooltip stays within viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust X position if tooltip goes off right edge
      if (tooltipRect.right > viewportWidth) {
        setPosition(prev => ({
          ...prev,
          x: prev.x - (tooltipRect.right - viewportWidth) - 20
        }));
      }
      
      // Adjust Y position if tooltip goes off bottom edge
      if (tooltipRect.bottom > viewportHeight) {
        setPosition(prev => ({
          ...prev,
          y: prev.y - (tooltipRect.bottom - viewportHeight) - 20
        }));
      }
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className="inline"
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className="absolute z-10 bg-gray-900 text-white p-3 rounded shadow-lg max-w-xs swapido-tooltip"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px` 
          }}
        >
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs mt-1">{description}</div>
        </div>
      )}
    </div>
  );
};

export default WalletTooltip;
