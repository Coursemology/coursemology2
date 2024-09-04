import { Control, Controller, useWatch } from 'react-hook-form';

import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

const BlocksInvalidBrowserFormField = ({
  control,
  disabled,
}: {
  control: Control;
  disabled?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  const sessionProtected = useWatch({ name: 'session_protected', control });
  const hasMonitoringSecret = useWatch({ name: 'monitoring.secret', control });

  return (
    <Controller
      control={control}
      name="monitoring.blocks"
      render={({ field, fieldState }): JSX.Element => (
        <FormCheckboxField
          description={t(translations.blocksAccessesFromInvalidSUSHint)}
          disabled={!sessionProtected || !hasMonitoringSecret || disabled}
          disabledHint={
            !sessionProtected || !hasMonitoringSecret
              ? t(translations.needSUSAndSessionUnlockPassword)
              : undefined
          }
          field={field}
          fieldState={fieldState}
          label={t(translations.blocksAccessesFromInvalidSUS)}
        />
      )}
    />
  );
};

export default BlocksInvalidBrowserFormField;
