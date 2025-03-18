import { useRef, useState } from 'react';
import { TimeZones } from 'types/course/admin/course';
import { EmailData } from 'types/users';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormRef } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import {
  AccountSettingsData,
  addEmail,
  fetchAccountSettings,
  fetchTimeZones,
  removeEmail,
  resendConfirmationEmail,
  setEmailAsPrimary,
  updateAccountSettings,
  updateProfilePicture,
} from '../operations';
import translations from '../translations';

import AccountSettingsForm from './AccountSettingsForm';

const fetchAccountSettingsAndTimeZones = (): Promise<
  [AccountSettingsData, TimeZones]
> => Promise.all([fetchAccountSettings(), fetchTimeZones()]);

const AccountSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const formRef = useRef<FormRef<AccountSettingsData>>(null);
  const [reloadForm, setReloadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateAccountSettings = (
    initialData: Partial<AccountSettingsData>,
    data: Partial<AccountSettingsData>,
  ): void => {
    setSubmitting(true);

    updateAccountSettings(data)
      .then((newData) => {
        formRef.current?.resetByMerging?.(newData);
        toast.success(t(formTranslations.changesSaved));
        setReloadForm((value) => !value);

        // Reload page when changing language is successful
        if (initialData.locale !== newData.locale) {
          setTimeout(() => {
            document.location.reload();
          }, 1000);
        }
      })
      .catch(formRef.current?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  const handleUploadProfilePicture = (
    image: File,
    onSuccess: () => void,
  ): void => {
    setSubmitting(true);

    toast
      .promise(updateProfilePicture(image), {
        pending: t(translations.uploadingProfilePicture),
        success: t(translations.profilePictureUpdated),
      })
      .then((newData) => {
        formRef.current?.resetByMerging?.(newData);
        onSuccess();
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleAddEmail = (
    email: EmailData['email'],
    onSuccess: () => void,
    onError: (message: string) => void,
  ): void => {
    setSubmitting(true);

    addEmail(email)
      .then((emails) => {
        formRef.current?.mutate?.(emails);
        toast.success(t(translations.emailAdded, { email }));
        onSuccess();
      })
      .catch((errors) => {
        if (errors?.email) {
          onError(errors.email);
        } else {
          toast.error(t(translations.errorAddingEmail, { email }));
        }
      })
      .finally(() => setSubmitting(false));
  };

  const handleRemoveEmail = (
    id: EmailData['id'],
    email: EmailData['email'],
  ): void => {
    setSubmitting(true);

    removeEmail(id)
      .then((emails) => {
        formRef.current?.mutate?.(emails);
        toast.success(t(translations.emailRemoved, { email }));
      })
      .catch(() => {
        toast.error(t(translations.errorRemovingEmail, { email }));
      })
      .finally(() => setSubmitting(false));
  };

  const handleSetEmailAsPrimary = (
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
    email: EmailData['email'],
  ): void => {
    setSubmitting(true);

    setEmailAsPrimary(url)
      .then((emails) => {
        formRef.current?.mutate?.(emails);
        toast.success(t(translations.emailSetAsPrimary, { email }));
      })
      .catch(() => {
        toast.error(t(translations.errorSettingPrimaryEmail, { email }));
      })
      .finally(() => setSubmitting(false));
  };

  const handleResendConfirmationEmail = (
    url: NonNullable<EmailData['confirmationEmailPath']>,
    email: EmailData['email'],
  ): void => {
    setSubmitting(true);

    resendConfirmationEmail(url)
      .then(() => {
        toast.success(t(translations.confirmationEmailSent, { email }));
      })
      .catch(() => {
        toast.error(t(translations.errorSendingConfirmationEmail, { email }));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Page>
      <Preload
        render={<LoadingIndicator />}
        syncsWith={[reloadForm]}
        while={fetchAccountSettingsAndTimeZones}
      >
        {([settings, timeZones]): JSX.Element => (
          <AccountSettingsForm
            ref={formRef}
            disabled={submitting}
            onAddEmail={handleAddEmail}
            onRemoveEmail={handleRemoveEmail}
            onResendConfirmationEmail={handleResendConfirmationEmail}
            onSetEmailAsPrimary={handleSetEmailAsPrimary}
            onSubmit={handleUpdateAccountSettings}
            onUpdateProfilePicture={handleUploadProfilePicture}
            settings={settings}
            timeZones={timeZones}
          />
        )}
      </Preload>
    </Page>
  );
};

const handle = translations.accountSettings;

export default Object.assign(AccountSettings, { handle });
