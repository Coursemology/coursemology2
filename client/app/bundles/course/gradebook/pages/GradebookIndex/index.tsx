import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { PeopleAlt } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useCourseContext } from '../../../container/CourseLoader';
import GradebookTable from '../../components/GradebookTable';
import fetchGradebook from '../../operations';
import {
  getAssessments,
  getCategories,
  getGamificationEnabled,
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
  noStudents: {
    id: 'course.gradebook.GradebookIndex.noStudents',
    defaultMessage: 'No students enrolled yet',
  },
  noStudentsHint: {
    id: 'course.gradebook.GradebookIndex.noStudentsHint',
    defaultMessage: 'Grades will appear here once students join the course.',
  },
});

const GradebookIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { courseTitle } = useCourseContext();
  const { courseId: courseIdParam } = useParams();
  const courseId = parseInt(courseIdParam!, 10);
  const [isLoading, setIsLoading] = useState(true);

  const assessments = useAppSelector(getAssessments);
  const categories = useAppSelector(getCategories);
  const tabs = useAppSelector(getTabs);
  const students = useAppSelector(getStudents);
  const submissions = useAppSelector(getSubmissions);
  const gamificationEnabled = useAppSelector(getGamificationEnabled);

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
      {content}
    </Page>
  );
};

export default GradebookIndex;
