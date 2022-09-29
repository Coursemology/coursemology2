import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { MaterialsSettingsData } from 'types/course/admin/materials';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import MaterialsSettingsForm from './MaterialsSettingsForm';
import { fetchMaterialsSettings, updateMaterialsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const MaterialsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MaterialsSettingsData>();
  const [form, setForm] = useState<FormEmitter>();

  useEffect(() => {
    fetchMaterialsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const submit = (data: MaterialsSettingsData): void => {
    updateMaterialsSettings(data)
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
    <MaterialsSettingsForm
      data={settings}
      onSubmit={submit}
      emitsVia={setForm}
    />
  );
};

export default MaterialsSettings;
