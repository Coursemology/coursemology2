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

  const enableBrowserAuthorization = useWatch({
    name: 'monitoring.browser_authorization',
    control,
  });

  return (
    <Controller
      control={control}
      name="monitoring.blocks"
      render={({ field, fieldState }): JSX.Element => (
        <FormCheckboxField
          description={t(translations.blocksAccessesFromInvalidSUSHint)}
          disabled={
            !sessionProtected || !enableBrowserAuthorization || disabled
          }
          disabledHint={
            !sessionProtected || !enableBrowserAuthorization
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
