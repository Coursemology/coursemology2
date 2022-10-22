import { useState } from 'react';
import { toast } from 'react-toastify';

import { MaterialsSettingsData } from 'types/course/admin/materials';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import MaterialsSettingsForm from './MaterialsSettingsForm';
import { fetchMaterialsSettings, updateMaterialsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const MaterialsSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: MaterialsSettingsData): void => {
    setSubmitting(true);

    updateMaterialsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload while={fetchMaterialsSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <MaterialsSettingsForm
          data={data}
          onSubmit={handleSubmit}
          emitsVia={setForm}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default MaterialsSettings;
