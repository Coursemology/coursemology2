import { useState } from 'react';
import { MaterialsSettingsData } from 'types/course/admin/materials';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import MaterialsSettingsForm from './MaterialsSettingsForm';
import { fetchMaterialsSettings, updateMaterialsSettings } from './operations';

const MaterialsSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter<MaterialsSettingsData>>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: MaterialsSettingsData): void => {
    setSubmitting(true);

    updateMaterialsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadItems();
        toast.success(t(translations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchMaterialsSettings}>
      {(data): JSX.Element => (
        <MaterialsSettingsForm
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default MaterialsSettings;
