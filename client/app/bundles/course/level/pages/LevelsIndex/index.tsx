import { defineMessages } from 'react-intl';
import { Skeleton, Stack, Typography } from '@mui/material';

import componentTranslations from 'course/translations';
import Page from 'lib/components/core/layouts/Page';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchLevels } from '../../operations';

import LevelsManager from './LevelsManager';

const translations = defineMessages({
  levelHeader: {
    id: 'course.level.Level.levelHeader',
    defaultMessage: 'Levels',
  },
});

const LevelsIndex = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fetchLevelsData = async (): Promise<void> => {
    await dispatch(fetchLevels());
  };

  const preloadSkeleton = (
    <Stack spacing={0.5}>
      {Array.from({ length: 15 }, (_, index) => (
        <Skeleton key={index} height={50.5} variant="rounded" />
      ))}
    </Stack>
  );

  return (
    <Page
      title={
        <Typography variant="h5">
          {t(componentTranslations.course_levels_component)}
        </Typography>
      }
    >
      <Preload render={preloadSkeleton} while={fetchLevelsData}>
        {(): JSX.Element => <LevelsManager />}
      </Preload>
    </Page>
  );
};

const handle = translations.levelHeader;
export default Object.assign(LevelsIndex, { handle });
