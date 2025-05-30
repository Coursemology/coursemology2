import { FC } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';

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
  { value: 'prompt_count', label: 'Prompt Count' },
  { value: 'prompt_length', label: 'Prompt Length' },
];

const LiveFeedbackMetricSelector: FC<Props> = ({
  selectedMetric,
  setSelectedMetric,
}) => {
  return (
    <Box className="my-2 w-1/2">
      <Autocomplete
        clearOnEscape
        disablePortal
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        onChange={(_, value) => {
          if (value) setSelectedMetric(value);
        }}
        options={metricOptions}
        renderInput={(params) => (
          <TextField {...params} label="Metric" variant="outlined" />
        )}
        value={selectedMetric}
      />
    </Box>
  );
};

export default LiveFeedbackMetricSelector;
