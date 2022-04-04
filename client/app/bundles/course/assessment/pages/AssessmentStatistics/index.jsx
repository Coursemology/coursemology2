import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';

import {
  fetchAncestors,
  fetchAncestorStatistics,
  fetchStatistics,
} from '../../actions';
import {
  ancestorShape,
  assessmentShape,
  courseUserShape,
  submissionRecordsShape,
} from '../../propTypes';

import AncestorSelect from './AncestorSelect';
import StatisticsPanel from './StatisticsPanel';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.assessment.statistics.fail',
    defaultMessage: 'Failed to fetch statistics.',
  },
  fetchAncestorsFailure: {
    id: 'course.assessment.statistics.ancestorFail',
    defaultMessage: 'Failed to fetch past iterations of this assessment.',
  },
  fetchAncestorStatisticsFailure: {
    id: 'course.assessment.statistics.ancestorStatisticsFail',
    defaultMessage: "Failed to fetch ancestor's statistics.",
  },
});

const styles = {
  ancestorStatistics: {
    marginBottom: '2rem',
  },
};

const AssessmentStatisticsPage = ({
  intl,
  isFetching,
  isError,
  isFetchingAncestors,
  isErrorAncestors,
  isFetchingAncestorStatistics,
  isErrorAncestorStatistics,
  dispatch,
  submissions,
  allStudents,
  ancestors,
  notification,
  ancestorAssessment,
  ancestorSubmissions,
  ancestorAllStudents,
}) => {
  const { assessmentId } = useParams();
  const [selectedAncestorId, setSelectedAncestorId] = useState(null);

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchStatistics(
          assessmentId,
          intl.formatMessage(translations.fetchFailure),
        ),
      );
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchAncestors(
          assessmentId,
          intl.formatMessage(translations.fetchAncestorsFailure),
        ),
      );
    }
  }, [assessmentId]);

  if (isFetching) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <ErrorCard
        message={<FormattedMessage {...translations.fetchFailure} />}
      />
    );
  }

  const fetchAncestorSubmissions = (id) => {
    if (id === assessmentId || id === selectedAncestorId) {
      return;
    }
    dispatch(
      fetchAncestorStatistics(
        id,
        intl.formatMessage(translations.fetchAncestorStatisticsFailure),
      ),
    );
    setSelectedAncestorId(id);
  };

  const renderAncestorSelect = () => {
    if (isFetchingAncestors) {
      return <LoadingIndicator />;
    }
    if (isErrorAncestors) {
      return (
        <ErrorCard
          message={<FormattedMessage {...translations.fetchAncestorsFailure} />}
        />
      );
    }
    return (
      <AncestorSelect
        ancestors={ancestors}
        assessmentId={assessmentId}
        selectedAncestorId={selectedAncestorId}
        setSelectedAncestorId={fetchAncestorSubmissions}
      />
    );
  };

  const renderAncestorStatistics = () => {
    if (selectedAncestorId == null) {
      return <>&nbsp;</>;
    }
    if (isFetchingAncestorStatistics) {
      return <LoadingIndicator />;
    }
    if (isErrorAncestorStatistics) {
      return (
        <ErrorCard
          message={
            <FormattedMessage
              {...translations.fetchAncestorStatisticsFailure}
            />
          }
        />
      );
    }
    return (
      <StatisticsPanel
        allStudents={ancestorAllStudents}
        assessment={ancestorAssessment}
        submissions={ancestorSubmissions}
      />
    );
  };

  return (
    <>
      <StatisticsPanel allStudents={allStudents} submissions={submissions} />
      {renderAncestorSelect()}
      <div style={styles.ancestorStatistics}>{renderAncestorStatistics()}</div>
      <NotificationBar notification={notification} />
    </>
  );
};

AssessmentStatisticsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  notification: notificationShape,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  isFetchingAncestors: PropTypes.bool.isRequired,
  isErrorAncestors: PropTypes.bool.isRequired,
  isFetchingAncestorStatistics: PropTypes.bool.isRequired,
  isErrorAncestorStatistics: PropTypes.bool.isRequired,

  submissions: PropTypes.arrayOf(submissionRecordsShape).isRequired,
  allStudents: PropTypes.arrayOf(courseUserShape).isRequired,
  ancestors: PropTypes.arrayOf(ancestorShape).isRequired,

  ancestorAssessment: assessmentShape,
  ancestorSubmissions: PropTypes.arrayOf(submissionRecordsShape),
  ancestorAllStudents: PropTypes.arrayOf(courseUserShape),
};

export default connect((state) => state.statisticsPage)(
  injectIntl(AssessmentStatisticsPage),
);
