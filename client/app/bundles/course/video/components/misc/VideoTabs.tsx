import { FC } from 'react';
import { URLSearchParamsInit } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';

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
  const videoTabs = useAppSelector(getVideoTabs);
  if (videoTabs.length <= 1) return null;
  return (
    <Box className="max-w-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          onChange={(_, value): void => {
            setCurrentTab({ tab: value });
          }}
          scrollButtons="auto"
          value={currentTab ?? videoTabs[0]?.id}
          variant="scrollable"
        >
          {videoTabs.map((tab) => (
            <Tab key={tab.id} label={tab.title} value={tab.id} />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default VideoTabs;
