import { Tabs, Tab } from '@mui/material';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { URLSearchParamsInit } from 'react-router-dom';
import { AppState } from 'types/store';
import { getVideoTabs } from '../../selectors';

interface Props {
  currentTab?: number;
  setCurrentTab: (
    nextInit: URLSearchParamsInit,
    navigateOptions?:
      | {
          replace?: boolean | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          state?: any;
        }
      | undefined,
  ) => void;
}

const VideoTabs: FC<Props> = (props) => {
  const { currentTab, setCurrentTab } = props;
  const videoTabs = useSelector((state: AppState) => getVideoTabs(state));
  if (videoTabs.length <= 1) return null;
  return (
    <Tabs
      onChange={(_, value): void => {
        setCurrentTab({ tab: value });
      }}
      value={currentTab ?? videoTabs[0]?.id}
      variant="scrollable"
      scrollButtons="auto"
    >
      {videoTabs.map((tab) => (
        <Tab key={tab.id} label={tab.title} value={tab.id} />
      ))}
    </Tabs>
  );
};

export default VideoTabs;
