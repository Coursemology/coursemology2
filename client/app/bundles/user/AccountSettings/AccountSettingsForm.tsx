import { useMemo, useState } from 'react';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { Alert } from '@mui/material';
import { TimeZones } from 'types/course/admin/course';
import { EmailData } from 'types/users';
import { object, ref, string } from 'yup';

import AvatarSelector from 'lib/components/core/AvatarSelector';
import Section from 'lib/components/core/layouts/Section';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';

import AddEmailSubsection, {
  AddEmailSubsectionEmitter,
} from '../components/AddEmailSubsection';
import EmailsList from '../components/EmailsList';
import { AccountSettingsData } from '../operations';
import translations from '../translations';

interface AccountSettingsFormProps extends Emits<FormEmitter> {
  settings: AccountSettingsData;
  timeZones: TimeZones;
  disabled?: boolean;
  onSubmit?: (data: Partial<AccountSettingsData>) => void;
  onUpdateProfilePicture?: (image: File, onSuccess: () => void) => void;
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
  const [stagedImage, setStagedImage] = useState<File>();
  const [requirePasswordConfirmation, toggleRequirePasswordConfirmation] =
    useToggle(true);

  const [addEmailSubsection, setAddEmailSubsection] =
    useState<AddEmailSubsectionEmitter>();

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
      dirty={Boolean(stagedImage)}
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.settings}
      onReset={(): void => {
        setStagedImage(undefined);
        addEmailSubsection?.reset?.();
      }}
      onSubmit={handleSubmit}
      submitsDirtyFieldsOnly
      validates={validationSchema}
    >
      {(control): JSX.Element => (
        <>
          <Section size="sm" sticksToNavbar title={t(translations.profile)}>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.name)}
                  required
                  variant="filled"
                />
              )}
            />

            <Controller
              control={control}
              name="timezone"
              render={({ field, fieldState }): JSX.Element => (
                <FormSelectField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.timeZone)}
                  native
                  options={timeZonesOptions}
                  required
                  variant="filled"
                />
              )}
            />

            <Controller
              control={control}
              name="imageUrl"
              render={({ field }): JSX.Element => (
                <AvatarSelector
                  circular
                  defaultImageUrl={field.value}
                  disabled={props.disabled}
                  onSelectImage={setStagedImage}
                  stagedImage={stagedImage}
                  title={t(translations.profilePicture)}
                />
              )}
            />
          </Section>

          <Section
            contentClassName="space-y-0"
            size="sm"
            sticksToNavbar
            title={t(translations.emails)}
          >
            <Controller
              control={control}
              name="emails"
              render={({ field }): JSX.Element => (
                <EmailsList
                  disabled={props.disabled}
                  emails={field.value}
                  onRemoveEmail={props.onRemoveEmail}
                  onResendConfirmationEmail={props.onResendConfirmationEmail}
                  onSetEmailAsPrimary={props.onSetEmailAsPrimary}
                />
              )}
            />

            <AddEmailSubsection
              disabled={props.disabled}
              emitsVia={setAddEmailSubsection}
              onClickAddEmail={props.onAddEmail}
            />
          </Section>

          <Section
            size="sm"
            sticksToNavbar
            title={t(translations.changePassword)}
          >
            <Controller
              control={control}
              name="currentPassword"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  inputProps={{ autoComplete: 'off' }}
                  label={t(translations.currentPassword)}
                  showPasswordVisibilityHint
                  type="password"
                  variant="filled"
                />
              )}
            />

            <Alert className="!my-4" severity="info">
              {t(translations.newPasswordRequirementHint)}
            </Alert>

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  inputProps={{ autoComplete: 'new-password' }}
                  label={t(translations.newPassword)}
                  onChangePasswordVisibility={toggleRequirePasswordConfirmation}
                  showPasswordVisibilityHint
                  type="password"
                  variant="filled"
                />
              )}
            />

            {requirePasswordConfirmation && (
              <Controller
                control={control}
                name="passwordConfirmation"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={props.disabled}
                    disablePasswordVisibilitySwitch
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    label={t(translations.newPasswordConfirmation)}
                    onCopy={(e): void => e.preventDefault()}
                    onCut={(e): void => e.preventDefault()}
                    onPaste={(e): void => e.preventDefault()}
                    type="password"
                    variant="filled"
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
