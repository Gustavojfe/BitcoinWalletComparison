import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * WalletTooltip Component
 * 
 * Provides consistent tooltip handling for wallet names and descriptions.
 * Uses Radix UI Tooltip for consistent, accessible tooltips that appear above the element.
 */
const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex cursor-help"
            title={`${title}: ${description}`} // Native title for fallback
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          sideOffset={5}
          className="max-w-[350px] p-3 z-[100] bg-popover text-popover-foreground"
        >
          <h3 className="font-medium text-sm mb-1">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground whitespace-normal break-words leading-relaxed">{description}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WalletTooltip;
