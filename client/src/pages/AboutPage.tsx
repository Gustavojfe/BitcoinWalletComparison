import { useLanguage } from '@/hooks/use-language';

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('about.title')}</h2>
      <div className="prose prose-blue max-w-none">
        <p>
          {t('about.introText')}
        </p>
        <p>
          {t('about.dataSources')}
        </p>
        <ul>
          <li>{t('about.officialDocs')}</li>
          <li>{t('about.github')}</li>
          <li>{t('about.userFeedback')}</li>
          <li>{t('about.developerComm')}</li>
        </ul>
        <p>
          {t('about.keepCurrent')}
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.methodology')}</h3>
        <p>
          {t('about.methodologyText')}
        </p>
        <p>
          {t('about.evaluations')}
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.futurePlans')}</h3>
        <p>
          {t('about.plansText')}
        </p>
        <ul>
          <li>{t('about.expandWallets')}</li>
          <li>{t('about.addReviews')}</li>
          <li>{t('about.metrics')}</li>
          <li>{t('about.testing')}</li>
          <li>{t('about.community')}</li>
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-4">{t('about.aboutUs')}</h3>
        <p>
          {t('about.aboutUsText')}
        </p>
        <p>
          <strong>{t('about.contact')}:</strong> {t('about.contactText')}
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
