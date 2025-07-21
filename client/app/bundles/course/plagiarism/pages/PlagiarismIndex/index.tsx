import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchAssessments } from '../../operations';

import AssessmentsPlagiarismTable from './assessments/AssessmentsPlagiarismTable';

const translations = defineMessages({
  plagiarism: {
    id: 'course.plagiarism.PlagiarismIndex.header.plagiarism',
    defaultMessage: 'Plagiarism Check',
  },
});

const PlagiarismIndex = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Preload
      render={<LoadingIndicator />}
      while={async () => {
        await dispatch(fetchAssessments());
      }}
    >
      <Page title={t(translations.plagiarism)}>
        <AssessmentsPlagiarismTable />
      </Page>
    </Preload>
  );
};

const handle = translations.plagiarism;

export default Object.assign(PlagiarismIndex, { handle });
