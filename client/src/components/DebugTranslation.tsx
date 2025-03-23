import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { FeatureValue } from '@/lib/types';

// This is a temporary debug component
const DebugTranslation = () => {
  const { language, t } = useLanguage();
  
  const featureValues: FeatureValue[] = [
    'desktop', 'ios', 'android', 'web',
    'custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node',
    'yes', 'no', 'partial', 'custom', 'send_only', 'receive_only', 'mandatory', 'optional', 'not_possible'
  ];
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-auto text-xs">
      <h3 className="text-sm font-bold mb-2">Translation Debug ({language})</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Key</th>
            <th className="text-left">Translation</th>
          </tr>
        </thead>
        <tbody>
          {featureValues.map(value => (
            <tr key={value}>
              <td className="pr-2">{value}</td>
              <td>{t(`features.${value}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DebugTranslation;