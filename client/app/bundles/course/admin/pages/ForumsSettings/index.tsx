import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ForumsSettingsData } from 'types/course/admin/forums';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ForumsSettingsForm from './ForumsSettingsForm';
import { fetchForumsSettings, updateForumsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const ForumsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ForumsSettingsData>();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForumsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const handleSubmit = (data: ForumsSettingsData): void => {
    setSubmitting(true);

    updateForumsSettings(data)
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
    <ForumsSettingsForm
      data={settings}
      onSubmit={handleSubmit}
      emitsVia={setForm}
      disabled={submitting}
    />
  );
};

export default ForumsSettings;
