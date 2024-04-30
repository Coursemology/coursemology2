import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import { VideoTab } from 'course/duplication/types';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import VideoTabTree, { setVideoAllInTab } from './VideoTabTree';

interface BodyProps {
  tabs: VideoTab[];
}

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

const setVideoTabAll: (
  dispatch: AppDispatch,
  tabs: VideoTab[],
) => (value: boolean) => void = (dispatch, tabs) => (value) => {
  tabs.forEach((tab) => setVideoAllInTab(dispatch, tab)(value));
};

const VideoBody: FC<BodyProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { tabs } = props;

  if (tabs.length < 1) {
    return (
      <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
    );
  }

  return (
    <>
      {tabs.length > 1 ? (
        <BulkSelectors
          callback={setVideoTabAll(dispatch, tabs)}
          selectLinkClassName="ml-0 leading-6"
        />
      ) : null}
      {tabs.map((tab) => (
        <VideoTabTree key={tab.id} tab={tab} />
      ))}
    </>
  );
};

export default VideoBody;
