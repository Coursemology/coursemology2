import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { AnnouncementsSettingsData } from 'types/course/admin/announcements';
import translations from 'lib/translations/form';
import useTranslation from 'lib/hooks/useTranslation';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import AnnouncementsSettingsForm from './AnnouncementsSettingsForm';
import {
  fetchAnnouncementsSettings,
  updateAnnouncementsSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const AnnouncementsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AnnouncementsSettingsData>();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncementsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const handleSubmit = (data: AnnouncementsSettingsData): void => {
    setSubmitting(true);

    updateAnnouncementsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch((errors) => {
        setReactHookFormError(form?.setError, errors);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <AnnouncementsSettingsForm
      data={settings}
      onSubmit={handleSubmit}
      emitsVia={setForm}
      disabled={submitting}
    />
  );
};

export default AnnouncementsSettings;
