import { ComponentRef, useRef, useState } from 'react';
import { GradebookSettingsData } from 'types/course/admin/gradebook';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import GradebookSettingsForm from './GradebookSettingsForm';
import {
  fetchGradebookSettings,
  updateGradebookSettings,
} from './operations';

const GradebookSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const formRef = useRef<ComponentRef<typeof GradebookSettingsForm>>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: GradebookSettingsData): void => {
    setSubmitting(true);

    updateGradebookSettings(data)
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
    <Preload render={<LoadingIndicator />} while={fetchGradebookSettings}>
      {(data): JSX.Element => (
        <GradebookSettingsForm
          ref={formRef}
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default GradebookSettings;
