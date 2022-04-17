import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchLearningRates } from '../../actions/personalized-timelines';
import { learningRateRecordShape } from './propTypes';
import SettingsPanel from './SettingsPanel';
import SupportingData from './SupportingData';

const PersonalizedTimelineSettings = ({
  minOverallLimit,
  maxOverallLimit,
  hardMinLearningRate,
  hardMaxLearningRate,
  earliestOpenAt,
  latestEndAt,
  learningRateRecords,
  isFetching,
  dispatch,
}) => {
  useEffect(() => {
    dispatch(fetchLearningRates());
  }, [dispatch]);

  return (
    <>
      <SettingsPanel
        minOverallLimit={minOverallLimit}
        maxOverallLimit={maxOverallLimit}
        hardMinLearningRate={hardMinLearningRate}
        hardMaxLearningRate={hardMaxLearningRate}
        earliestOpenAt={earliestOpenAt}
        latestEndAt={latestEndAt}
      />
      <SupportingData
        isFetching={isFetching}
        learningRateRecords={learningRateRecords}
      />
    </>
  );
};

PersonalizedTimelineSettings.propTypes = {
  minOverallLimit: PropTypes.number.isRequired,
  maxOverallLimit: PropTypes.number.isRequired,
  hardMinLearningRate: PropTypes.number,
  hardMaxLearningRate: PropTypes.number,
  earliestOpenAt: PropTypes.object,
  latestEndAt: PropTypes.object,
  learningRateRecords: PropTypes.arrayOf(learningRateRecordShape),
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => state.personalizedTimelineSettings)(
  PersonalizedTimelineSettings,
);
