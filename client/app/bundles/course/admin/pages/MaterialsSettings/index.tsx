import { ComponentRef, useRef, useState } from 'react';
import { MaterialsSettingsData } from 'types/course/admin/materials';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
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
  const formRef = useRef<ComponentRef<typeof MaterialsSettingsForm>>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: MaterialsSettingsData): void => {
    setSubmitting(true);

    updateMaterialsSettings(data)
      .then((newData) => {
        if (!newData) return;
        formRef.current?.resetTo?.(newData);
        reloadItems();
        toast.success(t(translations.changesSaved));
      })
      .catch(formRef.current?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchMaterialsSettings}>
      {(data): JSX.Element => (
        <MaterialsSettingsForm
          ref={formRef}
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default MaterialsSettings;
