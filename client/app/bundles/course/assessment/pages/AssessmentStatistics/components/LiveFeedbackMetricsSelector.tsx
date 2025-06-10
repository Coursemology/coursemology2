import { FC } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import InfoLabel from 'lib/components/core/InfoLabel';

interface MetricOption {
  value: string;
  label: string;
}

interface Props {
  selectedMetric: MetricOption;
  setSelectedMetric: (value: MetricOption) => void;
}

const metricOptions: MetricOption[] = [
  { value: 'grade', label: 'Grade' },
  { value: 'grade_diff', label: 'Grade Difference' },
  { value: 'messages_sent', label: 'Messages Sent' },
  { value: 'word_count', label: 'Word Count' },
];

const metricDescriptions: Record<string, React.ReactNode> = {
  grade: 'The final grade assigned to the student.',
  grade_diff: (
    <>
      The grade difference between the{' '}
      <b>last answer before the first message</b> and the{' '}
      <b>first answer after the last message</b>.
    </>
  ),
  messages_sent: 'The number of messages sent during the session.',
  word_count: "Total word count from the user's messages.",
};

const LiveFeedbackMetricSelector: FC<Props> = ({
  selectedMetric,
  setSelectedMetric,
}) => {
  const description =
    metricDescriptions[selectedMetric?.value] ||
    'Select a metric to see its description.'; // Just in case no metric is selected

  return (
    <Box className="my-2 w-1/2">
      <Box alignItems="center" display="flex" gap={1}>
        <Box flexGrow={1}>
          <Autocomplete
            clearOnEscape
            disablePortal
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onChange={(_, value) => {
              if (value) setSelectedMetric(value);
            }}
            options={metricOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Metric"
                variant="outlined"
              />
            )}
            value={selectedMetric}
          />
        </Box>
        <Tooltip
          placement="right"
          title={<Typography variant="body2">{description}</Typography>}
        >
          <div>
            <InfoLabel />
          </div>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default LiveFeedbackMetricSelector;
