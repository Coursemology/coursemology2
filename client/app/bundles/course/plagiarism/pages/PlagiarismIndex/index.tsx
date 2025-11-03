import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import useTranslation from 'lib/hooks/useTranslation';

import AssessmentsPlagiarismTable from './assessments/AssessmentsPlagiarismTable';

const translations = defineMessages({
  plagiarism: {
    id: 'course.plagiarism.PlagiarismIndex.header.plagiarism',
    defaultMessage: 'Plagiarism Check',
  },
});

const PlagiarismIndex = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page title={t(translations.plagiarism)}>
      <AssessmentsPlagiarismTable />
    </Page>
  );
};

const handle = translations.plagiarism;

export default Object.assign(PlagiarismIndex, { handle });
