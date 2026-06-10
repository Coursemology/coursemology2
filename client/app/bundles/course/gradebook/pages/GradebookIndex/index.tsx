import { FC, useEffect, useState, useTransition } from 'react';
import { defineMessages } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { PeopleAlt } from '@mui/icons-material';
import { Tab, Tabs, Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useCourseContext } from '../../../container/CourseLoader';
import GradebookTable from '../../components/GradebookTable';
import GradebookWeightedTable from '../../components/GradebookWeightedTable';
import WeightedViewHint from '../../components/WeightedViewHint';
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
    defaultMessage: 'Raw scores',
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'weighted'>(
    searchParams.get('view') === 'weighted' ? 'weighted' : 'all',
  );
  const [isPending, startTransition] = useTransition();

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
  } else if (weightedViewEnabled && viewMode === 'weighted') {
    content = (
      <GradebookWeightedTable
        assessments={assessments}
        canManageWeights={canManageWeights}
        categories={categories}
        courseId={courseId}
        courseTitle={courseTitle}
        gamificationEnabled={gamificationEnabled}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />
    );
  } else {
    content = (
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
  }

  return (
    <Page title={t(translations.gradebook)} unpadded>
      {!isLoading && canManageWeights && !weightedViewEnabled && (
        <WeightedViewHint courseId={courseId} />
      )}
      {weightedViewEnabled && !isLoading && students.length > 0 && (
        <Tabs
          className="border-only-b-neutral-200"
          onChange={(_, v: 'all' | 'weighted') =>
            startTransition(() => {
              setViewMode(v);
              setSearchParams(v === 'weighted' ? { view: 'weighted' } : {});
            })
          }
          TabIndicatorProps={{ style: { height: 2 } }}
          value={viewMode}
        >
          <Tab label={t(translations.allAssessments)} value="all" />
          <Tab label={t(translations.byWeight)} value="weighted" />
        </Tabs>
      )}
      <div className="relative">
        {isPending && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
            <LoadingIndicator.Delayed bare delayedForMS={150} size={32} />
          </div>
        )}
        <div
          className={
            isPending
              ? 'pointer-events-none opacity-50 transition-opacity'
              : 'transition-opacity'
          }
        >
          {content}
        </div>
      </div>
    </Page>
  );
};

export default GradebookIndex;
