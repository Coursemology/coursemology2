import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { Grid, Tab, Tabs } from '@mui/material';
import palette from 'theme/palette';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Group } from '@mui/icons-material';
import { fetchDisbursements, fetchForumDisbursements } from '../../operations';
import GeneralDisbursement from '../GeneralDisbursement';
import ForumDisbursement from '../ForumDisbursement';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchDisbursementFailure: {
    id: 'course.experience-points.disbursement.index.fetch.failure',
    defaultMessage: 'Failed to retrieve data.',
  },
  disbursements: {
    id: 'course.experience-points.disbursement.index.disbursement',
    defaultMessage: 'Disburse Experience Points',
  },
  forumTab: {
    id: 'course.experience-points.disbursement.index.forumTab',
    defaultMessage: 'Forum Participation',
  },
  generalTab: {
    id: 'course.experience-points.disbursement.index.generalTab',
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
            TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
            value={tabValue}
            variant="fullWidth"
            sx={{ marginBottom: 2 }}
          >
            <Tab
              id="forum-disbursement-tab"
              style={{ color: palette.submissionIcon.person }}
              icon={<FormatListBulletedIcon />}
              label={<FormattedMessage {...translations.forumTab} />}
              value="forum-disbursement-tab"
            />
            <Tab
              id="general-disbursement-tab"
              style={{ color: palette.submissionIcon.person }}
              icon={<Group />}
              label={<FormattedMessage {...translations.generalTab} />}
              value="general-disbursement-tab"
            />
          </Tabs>
          <Grid
            container
            direction="row"
            columnSpacing={2}
            rowSpacing={2}
            id="general-disbursement-tab"
            display={tabValue === 'general-disbursement-tab' ? 'flex' : 'none'}
          >
            <GeneralDisbursement />
          </Grid>
          <Grid
            container
            direction="column"
            columnSpacing={2}
            rowSpacing={2}
            id="forum-disbursement-tab"
            display={tabValue === 'forum-disbursement-tab' ? 'flex' : 'none'}
          >
            <ForumDisbursement />
          </Grid>
        </>
      )}
    </>
  );
};

export default injectIntl(DisbursementIndex);
