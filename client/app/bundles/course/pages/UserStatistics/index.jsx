import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';
import GeneralChart from 'lib/components/charts/GeneralChart';
import { GREEN_CHART_BACKGROUND, GREEN_CHART_BORDER } from 'theme/colors';

import { fetchUserStatistics } from '../../actions/user-statistics';
import { learningRateRecordShape } from './propTypes';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.user.userStatistics.fetchFailure',
    defaultMessage: 'Failed to fetch statistics.',
  },
  fetchFailureFull: {
    id: 'course.user.userStatistics.fetchFailureFull',
    defaultMessage: 'Failed to fetch statistics. Please refresh and try again.',
  },
  datasetLabel: {
    id: 'course.user.userStatistics.datasetLabel',
    defaultMessage: 'Learning Rate',
  },
  yAxisLabel: {
    id: 'course.user.userStatistics.yAxisLabel',
    defaultMessage: 'Learning Rate (%)',
  },
  xAxisLabel: {
    id: 'course.user.userStatistics.xAxisLabel',
    defaultMessage: 'Date',
  },
  note: {
    id: 'course.user.userStatistics.note',
    defaultMessage:
      'Note: A learning rate of 200% means that they can complete the course in half the time.',
  },
});

const UserStatistics = ({
  dispatch,
  learningRateRecords,
  isLoading,
  isError,
  notification,
  intl,
}) => {
  useEffect(() => {
    dispatch(
      fetchUserStatistics(intl.formatMessage(translations.fetchFailure)),
    );
  }, [dispatch]);

  const records = useMemo(
    () => learningRateRecords?.sort((a, b) => a.createdAt - b.createdAt),
    [learningRateRecords],
  );

  const data = useMemo(
    () => ({
      labels: records?.map((r) => r.createdAt),
      datasets: [
        {
          label: intl.formatMessage(translations.datasetLabel),
          backgroundColor: GREEN_CHART_BACKGROUND,
          borderColor: GREEN_CHART_BORDER,
          fill: false,
          data: records?.map((r) => r.learningRate),
        },
      ],
    }),
    [records, intl],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.raw}%`,
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'YYYY-MM-DD h:mm:ss a',
          },
          title: {
            display: true,
            text: intl.formatMessage(translations.xAxisLabel),
          },
        },
        y: {
          title: {
            display: true,
            text: intl.formatMessage(translations.yAxisLabel),
          },
        },
      },
    }),
    [intl],
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <ErrorCard message={intl.formatMessage(translations.fetchFailureFull)} />
    );
  }

  return (
    <>
      <div>{intl.formatMessage(translations.note)}</div>
      <GeneralChart type="line" options={options} data={data} />
      <NotificationBar notification={notification} />
    </>
  );
};

UserStatistics.propTypes = {
  dispatch: PropTypes.func.isRequired,
  learningRateRecords: PropTypes.arrayOf(learningRateRecordShape).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  notification: notificationShape,
  intl: intlShape.isRequired,
};

export default connect((state) => state.userStatistics)(
  injectIntl(UserStatistics),
);
