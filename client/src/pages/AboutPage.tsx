import { useLanguage } from '@/hooks/use-language';

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 bg-card shadow rounded-lg">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">{t('about.title')}</h2>
      <div className="prose prose-blue dark:prose-invert max-w-none">
        {/* Introduction */}
        <p>{t('about.intro1')}</p>
        <p>{t('about.intro2')}</p>
        <p>{t('about.intro3')}</p>
        
        {/* Our Story */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.ourStory')}</h3>
        <p>{t('about.story1')}</p>
        <p>{t('about.story2')}</p>
        
        {/* Who We Are */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.whoWeAre')}</h3>
        <ul>
          <li dangerouslySetInnerHTML={{ __html: t('about.person1') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('about.company1') }}></li>
        </ul>
        
        {/* Methodology */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.methodology')}</h3>
        <p>{t('about.methodologyIntro')}</p>
        <ul>
          <li>{t('about.method1')}</li>
          <li>{t('about.method2')}</li>
          <li>{t('about.method3')}</li>
          <li>{t('about.method4')}</li>
        </ul>
        <p>{t('about.methodNote')}</p>
        <p>{t('about.evaluations')}</p>
        
        {/* Why It Matters */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.whyItMatters')}</h3>
        <p>{t('about.why1')}</p>
        <p>{t('about.why2')}</p>
        <p>{t('about.why3')}</p>
        
        {/* Future Plans */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.futurePlans')}</h3>
        <p>{t('about.futurePlansIntro')}</p>
        <ul>
          <li>{t('about.plan1')}</li>
          <li>{t('about.plan2')}</li>
          <li>{t('about.plan3')}</li>
          <li>{t('about.plan4')}</li>
        </ul>
        
        {/* Contribute */}
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.contribute')}</h3>
        <p>{t('about.contributeIntro')}</p>
        <ul>
          <li dangerouslySetInnerHTML={{ __html: t('about.contrib1') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('about.contrib2') }}></li>
          <li>{t('about.contrib3')}</li>
        </ul>
        <p>{t('about.closing')}</p>
        <p>{t('about.final')}</p>
      </div>
    </div>
  );
};

export default AboutPage;
