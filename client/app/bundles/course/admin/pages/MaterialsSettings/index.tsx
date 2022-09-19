import { useState } from 'react';
import { toast } from 'react-toastify';

import { MaterialsSettingsData } from 'types/course/admin/materials';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import suspend from 'lib/hooks/suspended';
import MaterialsSettingsForm from './MaterialsSettingsForm';
import { fetchMaterialsSettings, updateMaterialsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const resource = suspend(fetchMaterialsSettings());

const MaterialsSettings = (): JSX.Element => {
  const settings = resource.read();
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

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
