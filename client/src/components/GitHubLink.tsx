import { Github } from 'lucide-react';
import { getGitHubRepo } from '@/lib/githubRepos';
import FeatureTooltip from './FeatureTooltip';
import { Wallet } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

interface GitHubLinkProps {
  walletName: string;
  wallet?: Wallet;
}

const GitHubLink = ({ walletName, wallet }: GitHubLinkProps) => {
  const { t } = useLanguage();
  
  // Get GitHub repository URL for this wallet
  const repoUrl = getGitHubRepo(walletName);
  
  // If no GitHub repo is found, just return null (parent component can handle fallback)
  if (!repoUrl) {
    return null;
  }
  
  // Get the translated label from the translation files
  const label = t('featureStatus.values.yes_github.label', undefined, 'Yes');
  
  return (
    <FeatureTooltip 
      value="yes_github" 
      featureName="openSource" 
      wallet={wallet || { id: 0, name: walletName, website: '', description: '', type: 'lightning', order: 0 }}
    >
      <a 
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <span className="flex items-center text-xs font-medium text-primary gap-1">
          <Github className="h-3.5 w-3.5" />
          {label}
        </span>
      </a>
    </FeatureTooltip>
  );
};

export default GitHubLink;