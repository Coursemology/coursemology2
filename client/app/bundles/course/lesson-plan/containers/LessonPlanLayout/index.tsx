import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ListSubheader } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchLessonPlan } from '../../operations';
import translations from '../../translations';
import LessonPlanFilter from '../LessonPlanFilter';
import LessonPlanNav from '../LessonPlanNav';

const styles = {
  tools: {
    position: 'fixed' as const,
    bottom: 12,
    right: 24,
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  mainBody: {
    // Allow end part of table to be unobstructed when scrolled all the way to the bottom
    marginBottom: 100,
  },
};

const LessonPlanLayout = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Selected field by field: the slice object gets a new identity on every change
  // to it, so selecting it whole would re-render the whole routed page — via
  // `Outlet` — each time an item is saved or a filter is toggled.
  const isLoading = useAppSelector(
    (state) => state.lessonPlan.lessonPlan.isLoading,
  );
  const groups = useAppSelector((state) => state.lessonPlan.lessonPlan.groups);

  useEffect(() => {
    dispatch(fetchLessonPlan());
  }, []);

  if (isLoading) return <LoadingIndicator />;

  if (!groups || groups.length < 1)
    return <ListSubheader disableSticky>{t(translations.empty)}</ListSubheader>;

  return (
    <div style={styles.mainBody}>
      <Outlet />

      <div style={styles.tools}>
        <LessonPlanNav />
        <LessonPlanFilter />
      </div>

      <DeleteConfirmation />
    </div>
  );
};

const handle = translations.lessonPlan;

export default Object.assign(LessonPlanLayout, { handle });
