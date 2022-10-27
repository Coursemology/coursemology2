import { useState } from 'react';
import { toast } from 'react-toastify';

import { CourseComponents } from 'types/course/admin/components';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import ComponentSettingsForm from './ComponentSettingsForm';
import { fetchComponentSettings, updateComponentSettings } from './operations';
import { useItemsReloader } from '../../components/SettingsNavigation';
import translations from './translations';

const ComponentSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (
    components: CourseComponents,
    action: (data: CourseComponents) => void,
  ): void => {
    setSubmitting(true);

    updateComponentSettings(components)
      .then((data) => {
        if (!data) return;
        action(data);
        reloadItems();
        toast.success(t(formTranslations.changesSavedAndRefresh));
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenUpdatingComponents));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload while={fetchComponentSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <ComponentSettingsForm
          data={data}
          onChangeComponents={handleSubmit}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default ComponentSettings;
