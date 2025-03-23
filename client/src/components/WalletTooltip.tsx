import { useState, useRef, useEffect } from 'react';
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

const WalletTooltip = ({ title, description, children }: TooltipProps) => {
  // Use shadcn's Tooltip component for better positioning and styling
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{children}</span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          className="bg-gray-900 text-white border-gray-800 max-w-sm p-3 z-50"
        >
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium mb-1">{title}</div>
            <div className="text-xs text-gray-200 max-w-xs">{description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WalletTooltip;
