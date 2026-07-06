import { Controller, useFormContext } from 'react-hook-form';
import { MessageDescriptor } from 'react-intl';
import { RadioGroup } from '@mui/material';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Subsection from 'lib/components/core/layouts/Subsection';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface GradingModeFieldProps {
  supportedGradingModes: string[];
  disabled?: boolean;
}

// Per-mode display metadata. Unknown modes fall back to their raw key so a newly-added backend mode still
// renders (just without a friendly name/description) until translations catch up.
const GRADING_MODE_METADATA: Record<
  string,
  { name: MessageDescriptor; description: MessageDescriptor }
> = {
  default: {
    name: translations.gradingModeDefaultName,
    description: translations.gradingModeDefaultDescription,
  },
  rubric: {
    name: translations.gradingModeRubricName,
    description: translations.gradingModeRubricDescription,
  },
};

/**
 * Radio switch for a question's grading mode, driven by the modes the backend reports the question type
 * supports. Renders nothing when there is only one supported mode (the mode is then fixed and needs no UI).
 */
const GradingModeField = (props: GradingModeFieldProps): JSX.Element | null => {
  const { supportedGradingModes, disabled } = props;
  const { t } = useTranslation();
  const { control } = useFormContext();

  if (!supportedGradingModes || supportedGradingModes.length <= 1) return null;

  return (
    <Subsection title={t(translations.gradingModeHeader)}>
      <Controller
        control={control}
        name="gradingMode"
        render={({ field }): JSX.Element => (
          <RadioGroup
            className="space-y-5"
            onChange={(_, value): void => field.onChange(value)}
            value={field.value ?? ''}
          >
            {supportedGradingModes.map((mode) => {
              const metadata = GRADING_MODE_METADATA[mode];
              return (
                <RadioButton
                  key={mode}
                  description={metadata && t(metadata.description)}
                  disabled={disabled}
                  label={metadata ? t(metadata.name) : mode}
                  value={mode}
                />
              );
            })}
          </RadioGroup>
        )}
      />
    </Subsection>
  );
};

export default GradingModeField;
