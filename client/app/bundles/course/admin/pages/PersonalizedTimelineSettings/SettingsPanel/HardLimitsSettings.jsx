import { Typography, Slider, Button } from '@mui/material';
import PropTypes from 'prop-types';

const FASTEST_LIMIT = 300; // Arbitrary
const SLOWEST_LIMIT = 30; // Arbitrary

const HardLimitsSettings = ({
  hardMinLearningRate,
  hardMaxLearningRate,
  setHardMinLearningRate,
  setHardMaxLearningRate,
}) => {
  const fastestRate =
    hardMinLearningRate != null ? Math.round(100 / hardMinLearningRate) : null;
  const slowestRate =
    hardMaxLearningRate != null ? Math.round(100 / hardMaxLearningRate) : null;

  const handleChangeMin = (_event, newMin) => {
    setHardMinLearningRate(100 / newMin);
  };

  const handleChangeMax = (_event, newMax) => {
    setHardMaxLearningRate(100 / newMax);
  };

  return (
    <>
      <Typography
        gutterBottom
        variant="h6"
        component="div"
        fontWeight="bold"
        fontSize="1.6rem"
        marginTop="1rem"
      >
        Learning Rate Hard Limits
      </Typography>
      <Typography fontSize="1.4rem">
        {fastestRate == null ? (
          <>
            Manual configuration of fastest hard limit is currently disabled. A
            suitable limit will be applied by the algorithm automatically.{' '}
            <Button variant="text" onClick={() => setHardMinLearningRate(1)}>
              Enable
            </Button>
          </>
        ) : (
          <>
            Fastest hard limit: {fastestRate}%.{' '}
            <Button variant="text" onClick={() => setHardMinLearningRate(null)}>
              Disable
            </Button>
          </>
        )}
      </Typography>
      <Slider
        defaultValue={fastestRate ?? 100}
        valueLabelDisplay="auto"
        min={100}
        max={FASTEST_LIMIT}
        disabled={fastestRate == null}
        onChange={handleChangeMin}
      />
      <Typography fontSize="1.4rem" marginTop="1rem">
        {slowestRate == null ? (
          <>
            Manual configuration of slowest hard limit is currently disabled. No
            limit will be applied.{' '}
            <Button variant="text" onClick={() => setHardMaxLearningRate(1)}>
              Enable
            </Button>
          </>
        ) : (
          <>
            Slowest hard limit: {slowestRate}%.{' '}
            <Button variant="text" onClick={() => setHardMaxLearningRate(null)}>
              Disable
            </Button>
          </>
        )}
      </Typography>
      <Slider
        defaultValue={slowestRate ?? 100}
        valueLabelDisplay="auto"
        min={SLOWEST_LIMIT}
        max={100}
        disabled={slowestRate == null}
        onChange={handleChangeMax}
      />
    </>
  );
};

HardLimitsSettings.propTypes = {
  hardMinLearningRate: PropTypes.number,
  hardMaxLearningRate: PropTypes.number,
  setHardMinLearningRate: PropTypes.func.isRequired,
  setHardMaxLearningRate: PropTypes.func.isRequired,
};

export default HardLimitsSettings;
