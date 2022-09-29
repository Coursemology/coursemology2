import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ForumsSettingsData } from 'types/course/admin/forums';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ForumsSettingsForm from './ForumsSettingsForm';
import { fetchForumsSettings, updateForumsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const ForumsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ForumsSettingsData>();
  const [form, setForm] = useState<FormEmitter>();

  useEffect(() => {
    fetchForumsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const submit = (data: ForumsSettingsData): void => {
    updateForumsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <ForumsSettingsForm data={settings} onSubmit={submit} emitsVia={setForm} />
  );
};

export default ForumsSettings;
