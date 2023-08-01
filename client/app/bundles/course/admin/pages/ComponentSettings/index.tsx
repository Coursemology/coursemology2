import { useState } from 'react';
import { CourseComponents } from 'types/course/admin/components';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import ComponentSettingsForm from './ComponentSettingsForm';
import { fetchComponentSettings, updateComponentSettings } from './operations';
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
    <Preload render={<LoadingIndicator />} while={fetchComponentSettings}>
      {(data): JSX.Element => (
        <ComponentSettingsForm
          data={data}
          disabled={submitting}
          onChangeComponents={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default ComponentSettings;
