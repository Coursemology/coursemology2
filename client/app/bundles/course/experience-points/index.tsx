import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';
import palette from 'theme/palette';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import {
  fetchDisbursements,
  fetchForumDisbursements,
} from './disbursement/operations';
import ForumDisbursement from './disbursement/pages/ForumDisbursement';
import GeneralDisbursement from './disbursement/pages/GeneralDisbursement';
import ExperiencePointsDetails from './ExperiencePointsDetails';

type Props = WrappedComponentProps;

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
    defaultMessage: 'Experience Point History',
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

const ExperiencePointsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('experience-points-tab');

  useEffect(() => {
    Promise.all([
      dispatch(fetchDisbursements()),
      dispatch(fetchForumDisbursements()),
    ])
      .catch(() => {
        toast.error(intl.formatMessage(translations.fetchDisbursementFailure));
      })
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  let componentToRender: JSX.Element;
  if (tabValue === 'forum-disbursement-tab') {
    componentToRender = <ForumDisbursement />;
  } else if (tabValue === 'general-disbursement-tab') {
    componentToRender = <GeneralDisbursement />;
  } else {
    componentToRender = <ExperiencePointsDetails />;
  }

  return (
    <Page title={intl.formatMessage(translations.experiencePoints)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Box className="max-w-full">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                  id="experience-points-tab"
                  label={
                    <FormattedMessage
                      {...translations.experiencePointsHistory}
                    />
                  }
                  style={{ color: palette.submissionIcon.person }}
                  value="experience-points-tab"
                />
                <Tab
                  id="forum-disbursement-tab"
                  label={
                    <FormattedMessage {...translations.forumDisbursementTab} />
                  }
                  style={{ color: palette.submissionIcon.person }}
                  value="forum-disbursement-tab"
                />
                <Tab
                  id="general-disbursement-tab"
                  label={
                    <FormattedMessage
                      {...translations.generalDisbursementTab}
                    />
                  }
                  style={{ color: palette.submissionIcon.person }}
                  value="general-disbursement-tab"
                />
              </Tabs>
            </Box>
          </Box>

          {componentToRender}
        </>
      )}
    </Page>
  );
};

const handle = translations.experiencePoints;

export default Object.assign(injectIntl(ExperiencePointsIndex), { handle });
