import { Control, Controller } from 'react-hook-form';

import BetaChip from 'lib/components/core/BetaChip';
import Link from 'lib/components/core/Link';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import useTranslation from 'lib/hooks/useTranslation';

import assessmentFormTranslations from '../AssessmentForm/translations';

import translations from './translations';

const EnableMonitoringFormField = ({
  control,
  pulsegridUrl,
  disabled,
  labelClassName,
}: {
  control: Control;
  pulsegridUrl?: string;
  disabled?: boolean;
  labelClassName?: string;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="monitoring.enabled"
      render={({ field, fieldState }): JSX.Element => (
        <FormCheckboxField
          description={t(translations.examMonitoringHint, {
            pulsegrid: (chunk) => (
              <Link opensInNewTab to={pulsegridUrl}>
                {chunk}
              </Link>
            ),
          })}
          disabled={disabled}
          disabledHint={t(assessmentFormTranslations.onlyManagersOwnersCanEdit)}
          field={field}
          fieldState={fieldState}
          label={
            <span className="flex items-center space-x-2">
              <span>{t(translations.examMonitoring)}</span>
              <BetaChip disabled={disabled} />
            </span>
          }
          labelClassName={labelClassName}
        />
      )}
    />
  );
};

export default EnableMonitoringFormField;
