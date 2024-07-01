import { FC } from 'react';
import { Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import VideoBody from './VideoBody';

const VideosSelector: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const { videosComponent: tabs } = duplication;

  if (!tabs) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_videos_component)}
      </Typography>
      <VideoBody tabs={tabs} />
    </>
  );
};

export default VideosSelector;
