import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  fetchDisbursements,
  fetchForumDisbursements,
} from './disbursement/operations';
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
    defaultMessage: 'Forum Participation Disbursement',
  },
  generalDisbursementTab: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.generalTab',
    defaultMessage: 'General Disbursement',
  },
});

const ExperiencePointsIndex: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('experience-points-tab');

  useEffect(() => {
    Promise.all([
      dispatch(fetchDisbursements()),
      dispatch(fetchForumDisbursements()),
    ])
      .catch(() => {
        toast.error(t(translations.fetchDisbursementFailure));
      })
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const tabComponentMapping = {
    'forum-disbursement-tab': <ForumDisbursement />,
    'general-disbursement-tab': <GeneralDisbursement />,
    'experience-points-tab': <ExperiencePointsDetails />,
  };

  const componentToRender = tabComponentMapping[tabValue] || (
    <ExperiencePointsDetails />
  );

  return (
    <Page title={t(translations.experiencePoints)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
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

          {componentToRender}
        </>
      )}
    </Page>
  );
};

const handle = translations.experiencePoints;

export default Object.assign(ExperiencePointsIndex, { handle });
