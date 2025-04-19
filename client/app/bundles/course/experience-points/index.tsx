import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import Page from 'lib/components/core/layouts/Page';
import useTranslation from 'lib/hooks/useTranslation';

import ForumDisbursement from './disbursement/pages/ForumDisbursement';
import GeneralDisbursement from './disbursement/pages/GeneralDisbursement';
import ExperiencePointsDetails from './ExperiencePointsDetails';

const translations = defineMessages({
  fetchDisbursementFailure: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.fetchDisbursementFailure',
    defaultMessage: 'Failed to retrieve data.',
  },
  experiencePoints: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.disbursements',
    defaultMessage: 'Experience Points',
  },
  experiencePointsHistory: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.experienceTab',
    defaultMessage: 'History',
  },
  forumDisbursementTab: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.forumTab',
    defaultMessage: 'Forum Participation',
  },
  generalDisbursementTab: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.generalTab',
    defaultMessage: 'General Disbursement',
  },
});

const ExperiencePointsIndex: FC = () => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState('experience-points-tab');

  const tabComponentMapping = {
    'forum-disbursement-tab': <ForumDisbursement />,
    'general-disbursement-tab': <GeneralDisbursement />,
    'experience-points-tab': <ExperiencePointsDetails />,
  };

  return (
    <Page title={t(translations.experiencePoints)} unpadded>
      <>
        <Box className="max-w-full border-b border-divider">
          <Tabs
            onChange={(_, value): void => {
              setTabValue(value);
            }}
            scrollButtons="auto"
            sx={tabsStyle}
            TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
            value={tabValue}
            variant="scrollable"
          >
            <Tab
              className="min-h-12"
              id="experience-points-tab"
              label={t(translations.experiencePointsHistory)}
              value="experience-points-tab"
            />
            <Tab
              className="min-h-12"
              id="forum-disbursement-tab"
              label={t(translations.forumDisbursementTab)}
              value="forum-disbursement-tab"
            />
            <Tab
              className="min-h-12"
              id="general-disbursement-tab"
              label={t(translations.generalDisbursementTab)}
              value="general-disbursement-tab"
            />
          </Tabs>
        </Box>

        {tabComponentMapping[tabValue]}
      </>
    </Page>
  );
};

const handle = translations.experiencePoints;

export default Object.assign(ExperiencePointsIndex, { handle });
