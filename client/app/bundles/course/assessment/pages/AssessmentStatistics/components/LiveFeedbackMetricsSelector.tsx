import { FC } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import InfoLabel from 'lib/components/core/InfoLabel';

export enum MetricType {
  GRADE = 'grade',
  GRADE_DIFF = 'grade_diff',
  MESSAGES_SENT = 'messages_sent',
  WORD_COUNT = 'word_count',
}

interface MetricOption {
  value: MetricType;
  label: string;
}

interface Props {
  selectedMetric: MetricOption;
  setSelectedMetric: (value: MetricOption) => void;
}

const metricOptions: MetricOption[] = [
  { value: MetricType.GRADE, label: 'Grade' },
  { value: MetricType.GRADE_DIFF, label: 'Grade Improvement' },
  { value: MetricType.MESSAGES_SENT, label: 'Messages Sent' },
  { value: MetricType.WORD_COUNT, label: 'Word Count' },
];

const metricDescriptions: Record<string, React.ReactNode> = {
  [MetricType.GRADE]: 'The final grade assigned to the student.',
  [MetricType.GRADE_DIFF]: (
    <>
      The grade difference between the{' '}
      <b>last answer before the first message</b> and the{' '}
      <b>first answer after the last message</b>.
    </>
  ),
  [MetricType.MESSAGES_SENT]: 'The number of messages sent during the session.',
  [MetricType.WORD_COUNT]: "Total word count from the user's messages.",
};

const LiveFeedbackMetricSelector: FC<Props> = ({
  selectedMetric,
  setSelectedMetric,
}) => {
  const description =
    metricDescriptions[selectedMetric?.value as string] ||
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
