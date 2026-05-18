import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { FormControlLabel, Switch, TextField } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import GradebookTable from '../../components/GradebookTable';
import fetchGradebook from '../../operations';
import { getAssessments, getStudents, getTabs } from '../../selectors';

const translations = defineMessages({
  gradebook: {
    id: 'course.gradebook.GradebookIndex.gradebook',
    defaultMessage: 'Gradebook',
  },
  fetchFailure: {
    id: 'course.gradebook.GradebookIndex.fetchFailure',
    defaultMessage: 'Failed to retrieve Gradebook.',
  },
  searchPlaceholder: {
    id: 'course.gradebook.GradebookIndex.searchPlaceholder',
    defaultMessage: 'Search by student name',
  },
  showRawScore: {
    id: 'course.gradebook.GradebookIndex.showRawScore',
    defaultMessage: 'Show raw score',
  },
});

const GradebookIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRawScore, setShowRawScore] = useState(false);

  const tabs = useAppSelector(getTabs);
  const assessments = useAppSelector(getAssessments);
  const students = useAppSelector(getStudents);

  useEffect(() => {
    dispatch(fetchGradebook())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchFailure)));
  }, [dispatch]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Page title={t(translations.gradebook)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2">
            <TextField
              className="w-96"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(translations.searchPlaceholder)}
              size="medium"
              value={searchQuery}
              variant="outlined"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showRawScore}
                  onChange={(e) => setShowRawScore(e.target.checked)}
                />
              }
              label={t(translations.showRawScore)}
            />
          </div>
          <div className="pl-4">
            <GradebookTable
              assessments={assessments}
              showRawScore={showRawScore}
              students={filteredStudents}
              tabs={tabs}
            />
          </div>
        </>
      )}
    </Page>
  );
};

export default GradebookIndex;
