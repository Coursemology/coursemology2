import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import GradebookTable from '../../components/GradebookTable';
import fetchGradebook from '../../operations';
import {
  getAssessments,
  getCategories,
  getStudents,
  getSubmissions,
  getTabs,
} from '../../selectors';

const translations = defineMessages({
  gradebook: {
    id: 'course.gradebook.GradebookIndex.gradebook',
    defaultMessage: 'Gradebook',
  },
  fetchFailure: {
    id: 'course.gradebook.GradebookIndex.fetchFailure',
    defaultMessage: 'Failed to retrieve Gradebook.',
  },
});

const GradebookIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const categories = useAppSelector(getCategories);
  const tabs = useAppSelector(getTabs);
  const assessments = useAppSelector(getAssessments);
  const students = useAppSelector(getStudents);
  const submissions = useAppSelector(getSubmissions);

  useEffect(() => {
    dispatch(fetchGradebook())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchFailure)));
  }, [dispatch]);

  return (
    <Page title={t(translations.gradebook)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <GradebookTable
          assessments={assessments}
          categories={categories}
          students={students}
          submissions={submissions}
          tabs={tabs}
        />
      )}
    </Page>
  );
};

export default GradebookIndex;
