import { useState } from 'react';
import { toast } from 'react-toastify';

import { AnnouncementsSettingsData } from 'types/course/admin/announcements';
import translations from 'lib/translations/form';
import useTranslation from 'lib/hooks/useTranslation';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Preload from 'lib/components/Preload';
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
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

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
    <Preload while={fetchAnnouncementsSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <AnnouncementsSettingsForm
          data={data}
          onSubmit={handleSubmit}
          emitsVia={setForm}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default AnnouncementsSettings;
