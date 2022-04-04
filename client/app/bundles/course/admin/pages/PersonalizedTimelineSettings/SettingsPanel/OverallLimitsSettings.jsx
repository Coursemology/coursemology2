import { Typography, Slider } from '@mui/material';
import PropTypes from 'prop-types';

const LOWEST_LIMIT = 0.3; // Arbitrary
const HIGHEST_LIMIT = 3; // Arbitrary

const OverallLimitsSettings = ({
  minOverallLimit,
  maxOverallLimit,
  isNumDays,
  numDays,
  earliestOpenAt,
  setMinOverallLimit,
  setMaxOverallLimit,
}) => {
  const handleChangeMin = (_event, newMin) => {
    if (isNumDays) {
      setMinOverallLimit(newMin / numDays);
    } else {
      setMinOverallLimit(newMin / 100);
    }
  };

  const handleChangeMax = (_event, newMax) => {
    if (isNumDays) {
      setMaxOverallLimit(newMax / numDays);
    } else {
      setMaxOverallLimit(newMax / 100);
    }
  };

  const renderText = () => {
    if (!isNumDays && !earliestOpenAt) {
      return (
        <Typography fontSize="1.4rem" marginBottom="1rem">
          Your course currently does not have any assessments created, thus we
          cannot compute its duration. However, you may adjust the minimum and
          maximum duration percentages accordingly.
        </Typography>
      );
    }
    if (!isNumDays) {
      return (
        <Typography fontSize="1.4rem" marginBottom="1rem">
          Your course currently does not have any assessments that have a
          deadline, thus we cannot compute its duration. However, you may adjust
          the minimum and maximum duration percentages accordingly.
        </Typography>
      );
    }
    return (
      <Typography fontSize="1.4rem" marginBottom="1rem">
        The duration of your course is currently {numDays} days long.
      </Typography>
    );
  };

  const renderSliders = () => {
    if (!isNumDays) {
      return (
        <>
          <Slider
            defaultValue={minOverallLimit * 100}
            valueLabelDisplay="auto"
            min={LOWEST_LIMIT * 100}
            max={100}
            onChange={handleChangeMin}
          />
          <Slider
            defaultValue={maxOverallLimit * 100}
            valueLabelDisplay="auto"
            min={HIGHEST_LIMIT * 100}
            max={200}
            onChange={handleChangeMax}
          />
        </>
      );
    }
    return (
      <>
        <Typography fontSize="1.4rem">
          Shortest possible completion duration:{' '}
          {Math.round(numDays * minOverallLimit)} days.
        </Typography>
        <Slider
          defaultValue={Math.round(numDays * minOverallLimit)}
          valueLabelDisplay="auto"
          min={Math.round(numDays * LOWEST_LIMIT)}
          max={numDays}
          onChange={handleChangeMin}
        />
        <Typography fontSize="1.4rem" marginTop="1rem">
          Longest possible completion duration:{' '}
          {Math.round(numDays * maxOverallLimit)} days.
        </Typography>
        <Slider
          defaultValue={Math.round(numDays * maxOverallLimit)}
          valueLabelDisplay="auto"
          min={numDays}
          max={Math.round(numDays * HIGHEST_LIMIT)}
          onChange={handleChangeMax}
        />
      </>
    );
  };
  return (
    <>
      <Typography
        variant="h6"
        component="div"
        fontWeight="bold"
        fontSize="1.6rem"
        marginTop="1rem"
      >
        Course Minimum and Maximum Duration
      </Typography>
      {renderText()}
      {renderSliders()}
    </>
  );
};

OverallLimitsSettings.propTypes = {
  minOverallLimit: PropTypes.number.isRequired,
  maxOverallLimit: PropTypes.number.isRequired,
  isNumDays: PropTypes.bool.isRequired,
  numDays: PropTypes.number.isRequired,
  earliestOpenAt: PropTypes.object,
  setMinOverallLimit: PropTypes.func.isRequired,
  setMaxOverallLimit: PropTypes.func.isRequired,
};

export default OverallLimitsSettings;
