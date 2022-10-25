import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert } from '@mui/material';
import { Emits } from 'react-emitter-factory';
import { object, string, ref } from 'yup';

import { EmailData } from 'types/users';
import { TimeZones } from 'types/course/admin/course';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import Section from 'lib/components/core/layouts/Section';
import AvatarSelector from 'lib/components/core/AvatarSelector';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import EmailsList from '../components/EmailsList';
import { AccountSettingsData } from '../operations';
import AddEmailSubsection from '../components/AddEmailSubsection';
import translations from '../translations';

interface AccountSettingsFormProps extends Emits<FormEmitter> {
  settings: AccountSettingsData;
  timeZones: TimeZones;
  disabled?: boolean;
  onSubmit?: (data: Partial<AccountSettingsData>) => void;
  onUpdateProfilePicture?: (image: Blob, onSuccess: () => void) => void;
  onAddEmail?: (
    email: EmailData['email'],
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => void;
  onRemoveEmail?: (id: EmailData['id'], email: EmailData['email']) => void;
  onSetEmailAsPrimary?: (
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
    email: EmailData['email'],
  ) => void;
  onResendConfirmationEmail?: (
    url: NonNullable<EmailData['confirmationEmailPath']>,
    email: EmailData['email'],
  ) => void;
}

const AccountSettingsForm = (props: AccountSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [stagedImage, setStagedImage] = useState<Blob>();
  const [requirePasswordConfirmation, toggleRequirePasswordConfirmation] =
    useToggle(true);

  const validationSchema = useMemo(
    () =>
      object().shape(
        {
          name: string().required(t(translations.nameRequired)),
          timezone: string().required(t(translations.timeZoneRequired)),
          currentPassword: string()
            .optional()
            .when('password', {
              is: Boolean,
              then: string().required(t(translations.currentPasswordRequired)),
            }),
          password: string()
            .optional()
            .when({
              is: Boolean,
              then: string().min(8, t(translations.newPasswordMinCharacters)),
            })
            .when(['currentPassword', 'passwordConfirmation'], {
              is: (currentPassword: string, passwordConfirmation: string) =>
                currentPassword || passwordConfirmation,
              then: string().required(t(translations.newPasswordRequired)),
            }),
          passwordConfirmation: string().when('password', {
            is: Boolean,
            then: requirePasswordConfirmation
              ? string()
                  .required(t(translations.newPasswordConfirmationRequired))
                  .equals(
                    [ref('password')],
                    t(translations.newPasswordConfirmationMustMatch),
                  )
              : string().optional().nullable(),
          }),
        },
        [
          ['currentPassword', 'password'],
          ['password', 'passwordConfirmation'],
        ],
      ),
    [requirePasswordConfirmation],
  );

  const timeZonesOptions = useMemo(
    () =>
      props.timeZones.map((timeZone) => ({
        value: timeZone.name,
        label: timeZone.displayName,
      })),
    [],
  );

  const handleSubmit = (data: Partial<AccountSettingsData>): void => {
    if (requirePasswordConfirmation) {
      data.passwordConfirmation ??= '';
    } else {
      delete data.passwordConfirmation;
    }

    if (stagedImage) {
      props.onUpdateProfilePicture?.(stagedImage, () => {
        setStagedImage(undefined);
        props.onSubmit?.(data);
      });
    } else {
      props.onSubmit?.(data);
    }
  };

  return (
    <Form
      initialValues={props.settings}
      onSubmit={handleSubmit}
      headsUp
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      dirty={Boolean(stagedImage)}
      onReset={(reset): void => {
        setStagedImage(undefined);
        reset?.();
      }}
      submitsDirtyFieldsOnly
      validates={validationSchema}
    >
      {(control, watch): JSX.Element => (
        <>
          <Section title={t(translations.profile)} size="sm" sticksToNavbar>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.name)}
                  variant="filled"
                  disabled={props.disabled}
                  fullWidth
                  required
                />
              )}
            />

            <Controller
              name="timezone"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormSelectField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.timeZone)}
                  variant="filled"
                  options={timeZonesOptions}
                  native
                  disabled={props.disabled}
                  required
                />
              )}
            />

            <AvatarSelector
              title={t(translations.profilePicture)}
              defaultImageUrl={watch('imageUrl')}
              stagedImage={stagedImage}
              onSelectImage={setStagedImage}
              disabled={props.disabled}
              circular
            />
          </Section>

          <Section title={t(translations.emails)} size="sm" sticksToNavbar>
            <Controller
              name="emails"
              control={control}
              render={({ field }): JSX.Element => (
                <EmailsList
                  emails={field.value}
                  disabled={props.disabled}
                  onRemoveEmail={props.onRemoveEmail}
                  onSetEmailAsPrimary={props.onSetEmailAsPrimary}
                  onResendConfirmationEmail={props.onResendConfirmationEmail}
                />
              )}
            />

            <AddEmailSubsection
              onClickAddEmail={props.onAddEmail}
              disabled={props.disabled}
            />
          </Section>

          <Section
            title={t(translations.changePassword)}
            size="sm"
            sticksToNavbar
          >
            <Controller
              name="currentPassword"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.currentPassword)}
                  variant="filled"
                  disabled={props.disabled}
                  type="password"
                  inputProps={{ autoComplete: 'off' }}
                  fullWidth
                  showPasswordVisibilityHint
                />
              )}
            />

            <Alert severity="info" className="!my-4">
              {t(translations.newPasswordRequirementHint)}
            </Alert>

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.newPassword)}
                  variant="filled"
                  disabled={props.disabled}
                  type="password"
                  inputProps={{ autoComplete: 'new-password' }}
                  fullWidth
                  onChangePasswordVisibility={toggleRequirePasswordConfirmation}
                  showPasswordVisibilityHint
                />
              )}
            />

            {requirePasswordConfirmation && (
              <Controller
                name="passwordConfirmation"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.newPasswordConfirmation)}
                    variant="filled"
                    disabled={props.disabled}
                    type="password"
                    fullWidth
                    disablePasswordVisibilitySwitch
                    onCut={(e): void => e.preventDefault()}
                    onCopy={(e): void => e.preventDefault()}
                    onPaste={(e): void => e.preventDefault()}
                  />
                )}
              />
            )}
          </Section>
        </>
      )}
    </Form>
  );
};

export default AccountSettingsForm;
