import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/LoadingIndicator';

import LearningRateMatrixChart from './LearningRateMatrixChart';
import { learningRateRecordShape } from './propTypes';

// To add more supporting data as we go along
const SupportingData = ({ learningRateRecords, isFetching }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
        Supporting Data
      </Typography>
      <Typography
        gutterBottom
        variant="subtitle1"
        component="div"
        marginBottom="1rem"
        fontSize="1.3rem"
      >
        You may choose to consider the data below when configuring the
        algorithm.
      </Typography>
      {isFetching ? (
        <LoadingIndicator />
      ) : (
        <LearningRateMatrixChart
          learningRateRecords={learningRateRecords}
          isFetching={isFetching}
        />
      )}
    </CardContent>
  </Card>
);

SupportingData.propTypes = {
  learningRateRecords: PropTypes.arrayOf(learningRateRecordShape),
  isFetching: PropTypes.bool.isRequired,
};

export default SupportingData;
