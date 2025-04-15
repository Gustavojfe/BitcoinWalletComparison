import React, { ReactNode } from 'react';
import { Link } from 'wouter';

interface RichTextProps {
  content: string;
}

/**
 * Safely renders text with links and basic formatting
 * 
 * This component parses HTML-like text from translations and renders it safely
 * using React components instead of dangerouslySetInnerHTML
 */
const RichText: React.FC<RichTextProps> = ({ content }) => {
  if (!content) return null;
  
  // Split the content by link tags to process it safely
  const parts = content.split(/(<a href='[^']*'[^>]*>[^<]*<\/a>|<strong>[^<]*<\/strong>)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<a href=')) {
          // Extract href, target, rel and text values
          const hrefMatch = part.match(/href='([^']*)'/);
          const targetMatch = part.match(/target='([^']*)'/);
          const relMatch = part.match(/rel='([^']*)'/);
          const textMatch = part.match(/>([^<]*)</);

          if (hrefMatch && textMatch) {
            const href = hrefMatch[1];
            const target = targetMatch ? targetMatch[1] : '_blank';
            const rel = relMatch ? relMatch[1] : 'noopener noreferrer';
            const text = textMatch[1];
            
            // Check if this is an internal link
            const isInternalLink = !href.startsWith('http') && !href.startsWith('//');
            
            if (isInternalLink) {
              return (
                <Link key={index} href={href}>
                  {text}
                </Link>
              );
            }
            
            // External link
            return (
              <a 
                key={index} 
                href={href} 
                target={target} 
                rel={rel}
              >
                {text}
              </a>
            );
          }
          return part;
        } else if (part.startsWith('<strong>')) {
          // Extract text from strong tag
          const textMatch = part.match(/<strong>([^<]*)<\/strong>/);
          if (textMatch) {
            return <strong key={index}>{textMatch[1]}</strong>;
          }
          return part;
        }
        
        // Regular text
        return part;
      })}
    </>
  );
};

export default RichText;