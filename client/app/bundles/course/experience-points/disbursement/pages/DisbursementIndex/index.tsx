import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Group } from '@mui/icons-material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Grid, Tab, Tabs } from '@mui/material';
import palette from 'theme/palette';
import { AppDispatch } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import { fetchDisbursements, fetchForumDisbursements } from '../../operations';
import ForumDisbursement from '../ForumDisbursement';
import GeneralDisbursement from '../GeneralDisbursement';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchDisbursementFailure: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.fetchDisbursementFailure',
    defaultMessage: 'Failed to retrieve data.',
  },
  disbursements: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.disbursements',
    defaultMessage: 'Disburse Experience Points',
  },
  forumTab: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.forumTab',
    defaultMessage: 'Forum Participation',
  },
  generalTab: {
    id: 'course.experiencePoints.disbursement.DisbursementIndex.generalTab',
    defaultMessage: 'General Disbursement',
  },
});

const DisbursementIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('forum-disbursement-tab');

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

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.disbursements)} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Tabs
            onChange={(_, value): void => {
              setTabValue(value);
            }}
            style={{
              backgroundColor: palette.background.default,
            }}
            sx={{ marginBottom: 2 }}
            TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
            value={tabValue}
            variant="fullWidth"
          >
            <Tab
              icon={<FormatListBulletedIcon />}
              id="forum-disbursement-tab"
              label={<FormattedMessage {...translations.forumTab} />}
              style={{ color: palette.submissionIcon.person }}
              value="forum-disbursement-tab"
            />
            <Tab
              icon={<Group />}
              id="general-disbursement-tab"
              label={<FormattedMessage {...translations.generalTab} />}
              style={{ color: palette.submissionIcon.person }}
              value="general-disbursement-tab"
            />
          </Tabs>
          <Grid
            columnSpacing={2}
            container
            direction="row"
            display={tabValue === 'general-disbursement-tab' ? 'flex' : 'none'}
            id="general-disbursement-tab"
            rowSpacing={2}
          >
            <GeneralDisbursement />
          </Grid>
          <Grid
            columnSpacing={2}
            container
            direction="column"
            display={tabValue === 'forum-disbursement-tab' ? 'flex' : 'none'}
            id="forum-disbursement-tab"
            rowSpacing={2}
          >
            <ForumDisbursement />
          </Grid>
        </>
      )}
    </>
  );
};

export default injectIntl(DisbursementIndex);
