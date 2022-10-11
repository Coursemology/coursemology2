import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { MaterialsSettingsData } from 'types/course/admin/materials';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import MaterialsSettingsForm from './MaterialsSettingsForm';
import { fetchMaterialsSettings, updateMaterialsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const MaterialsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MaterialsSettingsData>();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterialsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const handleSubmit = (data: MaterialsSettingsData): void => {
    setSubmitting(true);

    updateMaterialsSettings(data)
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
    <MaterialsSettingsForm
      data={settings}
      onSubmit={handleSubmit}
      emitsVia={setForm}
      disabled={submitting}
    />
  );
};

export default MaterialsSettings;
