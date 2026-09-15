import Page from 'lib/components/core/layouts/Page';
import useTranslation from 'lib/hooks/useTranslation';

import QuestionsTable from './QuestionsTable';
import translations from './translations';

const ProgrammingUpgradeIndex = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page title={t(translations.header)}>
      <QuestionsTable />
    </Page>
  );
};

const handle = translations.header;

export default Object.assign(ProgrammingUpgradeIndex, { handle });
