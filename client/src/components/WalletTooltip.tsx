import React from 'react';

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  return (
    <div className="tooltip-container">
      <div className="tooltip-trigger">
        {children}
      </div>
      <div className="tooltip-popup">
        <h3 className="tooltip-title">{title}</h3>
        <p className="tooltip-description">{description}</p>
      </div>
    </div>
  );
};

export default WalletTooltip;
