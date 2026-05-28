import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { PeopleAlt } from '@mui/icons-material';
import { Typography } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useCourseContext } from '../../../container/CourseLoader';
import GradebookTable from '../../components/GradebookTable';
import GradebookWeightedTable from '../../components/GradebookWeightedTable';
import fetchGradebook from '../../operations';
import {
  getAssessments,
  getCanManageWeights,
  getCategories,
  getGamificationEnabled,
  getStudents,
  getSubmissions,
  getTabs,
  getWeightedViewEnabled,
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
  noStudents: {
    id: 'course.gradebook.GradebookIndex.noStudents',
    defaultMessage: 'No students enrolled yet',
  },
  noStudentsHint: {
    id: 'course.gradebook.GradebookIndex.noStudentsHint',
    defaultMessage: 'Grades will appear here once students join the course.',
  },
  allAssessments: {
    id: 'course.gradebook.GradebookIndex.allAssessments',
    defaultMessage: 'All assessments',
  },
  byWeight: {
    id: 'course.gradebook.GradebookIndex.byWeight',
    defaultMessage: 'By weight',
  },
});

const GradebookIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { courseTitle } = useCourseContext();
  const { courseId: courseIdParam } = useParams();
  const courseId = parseInt(courseIdParam!, 10);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'weighted'>('all');

  const assessments = useAppSelector(getAssessments);
  const categories = useAppSelector(getCategories);
  const tabs = useAppSelector(getTabs);
  const students = useAppSelector(getStudents);
  const submissions = useAppSelector(getSubmissions);
  const gamificationEnabled = useAppSelector(getGamificationEnabled);
  const weightedViewEnabled = useAppSelector(getWeightedViewEnabled);
  const canManageWeights = useAppSelector(getCanManageWeights);

  useEffect(() => {
    dispatch(fetchGradebook())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchFailure)));
  }, [dispatch]);

  useEffect(() => {
    if (!weightedViewEnabled) setViewMode('all');
  }, [weightedViewEnabled]);

  let content: JSX.Element;
  if (isLoading) {
    content = <LoadingIndicator />;
  } else if (students.length === 0) {
    content = (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <PeopleAlt className="text-neutral-300" sx={{ fontSize: 48 }} />
        <Typography color="text.secondary" variant="h6">
          {t(translations.noStudents)}
        </Typography>
        <Typography color="text.disabled" variant="body2">
          {t(translations.noStudentsHint)}
        </Typography>
      </div>
    );
  } else {
    const viewToggle = weightedViewEnabled ? (
      <div className="flex px-5 pb-2 pt-3">
        <ToggleButtonGroup
          exclusive
          onChange={(_, v) => {
            if (v) setViewMode(v);
          }}
          size="small"
          value={viewMode}
        >
          <ToggleButton value="all">
            {t(translations.allAssessments)}
          </ToggleButton>
          <ToggleButton value="weighted">
            {t(translations.byWeight)}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    ) : null;

    const tableView =
      viewMode === 'weighted' && weightedViewEnabled ? (
        <GradebookWeightedTable
          assessments={assessments}
          canManageWeights={canManageWeights}
          categories={categories}
          students={students}
          submissions={submissions}
          tabs={tabs}
        />
      ) : (
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={courseId}
          courseTitle={courseTitle}
          gamificationEnabled={gamificationEnabled}
          students={students}
          submissions={submissions}
          tabs={tabs}
        />
      );

    content = (
      <>
        {viewToggle}
        {tableView}
      </>
    );
  }

  return (
    <Page title={t(translations.gradebook)} unpadded>
      {content}
    </Page>
  );
};

export default GradebookIndex;
