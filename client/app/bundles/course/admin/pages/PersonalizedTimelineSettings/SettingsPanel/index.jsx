import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { blue } from '@mui/material/colors';
import PropTypes from 'prop-types';
import { useState } from 'react';
import OverallLimitsSettings from './OverallLimitsSettings';
import HardLimitsSettings from './HardLimitsSettings';

const styles = {
  root: {
    marginBottom: '2rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
};

const SettingsPanel = ({
  minOverallLimit,
  maxOverallLimit,
  hardMinLearningRate,
  hardMaxLearningRate,
  earliestOpenAt,
  latestEndAt,
}) => {
  const isNumDays = earliestOpenAt != null && latestEndAt != null;
  const numDays = isNumDays
    ? Math.round(
        (latestEndAt.getTime() - earliestOpenAt.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const [newMinOverallLimit, setNewMinOverallLimit] = useState(minOverallLimit);
  const [newMaxOverallLimit, setNewMaxOverallLimit] = useState(maxOverallLimit);
  const [newHardMinLearningRate, setNewHardMinLearningRate] =
    useState(hardMinLearningRate);
  const [newHardMaxLearningRate, setNewHardMaxLearningRate] =
    useState(hardMaxLearningRate);

  return (
    <Card style={styles.root} variant="outlined">
      <CardContent style={styles.content}>
        <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
          Learning Rate Algorithm Configuration
        </Typography>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: blue[100],
              paddingLeft: 0,
            }}
          >
            <Typography fontSize="1.5rem">
              How Learning Rates and Personalized Timelines Work
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography fontSize="1.4rem" marginBottom="0.75rem">
              Every time a student submits an assessment, their learning rate is
              calculated. This learning rate is based on how early or late the
              student submits their work.
            </Typography>
            <Typography fontSize="1.4rem" marginBottom="0.75rem">
              Based on this learning rate, the algorithm automatically adjusts
              the opening and closing timings of subsequent assessments such
              that the student gets to learn at their own pace.
            </Typography>
            <Typography fontSize="1.4rem" marginBottom="0.75rem">
              However, the student will not be allowed to go so quickly or so
              slowly that they can finish the course instantly or can never
              finish the course. You can thus configure the earliest or latest
              that a student can finish the course, and we will help to handle
              the rest.
            </Typography>
            <Typography fontSize="1.4rem">
              You may also choose to directly set hard limits on the learning
              rate itself. Note that a learning rate of 200% means that they can
              complete the course in half the time.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <OverallLimitsSettings
          minOverallLimit={newMinOverallLimit}
          maxOverallLimit={newMaxOverallLimit}
          isNumDays={isNumDays}
          numDays={numDays}
          earliestOpenAt={earliestOpenAt}
          setMinOverallLimit={setNewMinOverallLimit}
          setMaxOverallLimit={setNewMaxOverallLimit}
        />
        <HardLimitsSettings
          hardMinLearningRate={newHardMinLearningRate}
          hardMaxLearningRate={newHardMaxLearningRate}
          setHardMinLearningRate={setNewHardMinLearningRate}
          setHardMaxLearningRate={setNewHardMaxLearningRate}
        />
        <Button variant="contained" sx={{ marginTop: '1rem' }}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

SettingsPanel.propTypes = {
  minOverallLimit: PropTypes.number.isRequired,
  maxOverallLimit: PropTypes.number.isRequired,
  hardMinLearningRate: PropTypes.number,
  hardMaxLearningRate: PropTypes.number,
  earliestOpenAt: PropTypes.object,
  latestEndAt: PropTypes.object,
};

export default SettingsPanel;
