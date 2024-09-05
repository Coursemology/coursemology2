import { Control, Controller, useWatch } from 'react-hook-form';
import { RadioGroup } from '@mui/material';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import useTranslation from 'lib/hooks/useTranslation';

import assessmentFormTranslations from '../AssessmentForm/translations';

import BrowserAuthorizationMethodOptionsFormFields from './BrowserAuthorizationMethodOptionsFormFields';
import translations from './translations';

const BrowserAuthorizationOptionsFormFields = ({
  control,
  pulsegridUrl,
  disabled,
}: {
  control: Control;
  pulsegridUrl?: string;
  disabled?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  const enableBrowserAuthorization = useWatch({
    name: 'monitoring.browser_authorization',
    control,
  });

  const authorizationMethod = useWatch({
    name: 'monitoring.browser_authorization_method',
    control,
  });

  return (
    <>
      <Controller
        control={control}
        name="monitoring.browser_authorization"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.enableBrowserAuthorizationHint, {
              pulsegrid: (chunk) => (
                <Link opensInNewTab to={pulsegridUrl}>
                  {chunk}
                </Link>
              ),
            })}
            disabled={disabled}
            disabledHint={t(
              assessmentFormTranslations.onlyManagersOwnersCanEdit,
            )}
            field={field}
            fieldState={fieldState}
            label={t(translations.enableBrowserAuthorization)}
            labelClassName="mt-8"
          />
        )}
      />

      {enableBrowserAuthorization && (
        <Subsection
          className="!mt-8"
          subtitle={t(translations.browserAuthorizationMethodHint, {
            pulsegrid: (chunk) => (
              <Link opensInNewTab to={pulsegridUrl}>
                {chunk}
              </Link>
            ),
          })}
          title={t(translations.browserAuthorizationMethod)}
        >
          <Controller
            control={control}
            name="monitoring.browser_authorization_method"
            render={({ field }): JSX.Element => (
              <RadioGroup className="space-y-5" {...field} value={field.value}>
                <RadioButton
                  className="my-0"
                  description={t(translations.userAgentHint, {
                    ua: (chunk) => (
                      <Link
                        external
                        opensInNewTab
                        to="https://en.wikipedia.org/wiki/User-Agent_header"
                      >
                        {chunk}
                      </Link>
                    ),
                  })}
                  disabled={disabled}
                  label={t(translations.userAgent)}
                  value="user_agent"
                />

                <RadioButton
                  className="my-0"
                  description={t(translations.sebConfigKeyHint, {
                    seb: (chunk) => (
                      <Link
                        external
                        opensInNewTab
                        to="https://safeexambrowser.org"
                      >
                        {chunk}
                      </Link>
                    ),
                    sebConfigKey: (chunk) => (
                      <Link
                        external
                        opensInNewTab
                        to="https://safeexambrowser.org/developer/seb-config-key.html"
                      >
                        {chunk}
                      </Link>
                    ),
                  })}
                  disabled={disabled}
                  label={t(translations.sebConfigKey)}
                  value="seb_config_key"
                />
              </RadioGroup>
            )}
          />

          <BrowserAuthorizationMethodOptionsFormFields
            authorizationMethod={authorizationMethod}
            className="mt-5"
            control={control}
            disabled={disabled}
            pulsegridUrl={pulsegridUrl}
          />
        </Subsection>
      )}
    </>
  );
};

export default BrowserAuthorizationOptionsFormFields;
