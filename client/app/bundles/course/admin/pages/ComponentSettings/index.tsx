import { toast } from 'react-toastify';

import { CourseComponents } from 'types/course/admin/components';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useState, useEffect } from 'react';
import ComponentSettingsForm from './ComponentSettingsForm';
import { fetchComponentSettings, updateComponentSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';
import translations from './translations';

const ComponentSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<CourseComponents>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComponentSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const handleSubmit = (
    components: CourseComponents,
    action: (data: CourseComponents) => void,
  ): void => {
    setSubmitting(true);

    updateComponentSettings(components)
      .then((data) => {
        if (!data) return;
        action(data);
        reloadOptions();
        toast.success(t(formTranslations.changesSavedAndRefresh));
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenUpdatingComponents));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <ComponentSettingsForm
      data={settings}
      onChangeComponents={handleSubmit}
      disabled={submitting}
    />
  );
};

export default ComponentSettings;
