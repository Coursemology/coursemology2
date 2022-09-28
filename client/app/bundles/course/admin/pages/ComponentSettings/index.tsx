import { toast } from 'react-toastify';

import { CourseComponents } from 'types/course/admin/components';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import useSuspendedFetch from 'lib/hooks/useSuspendedFetch';
import ComponentSettingsForm from './ComponentSettingsForm';
import { fetchComponentSettings, updateComponentSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const ComponentSettings = (): JSX.Element => {
  const { data: settings } = useSuspendedFetch(fetchComponentSettings);
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();

  const submit = (
    components: CourseComponents,
    action: (data: CourseComponents) => void,
  ): void => {
    updateComponentSettings(components)
      .then((data) => {
        if (!data) return;
        action(data);
        reloadOptions();
        toast.success(t(translations.changesSavedAndRefresh));
      })
      .catch((error: Error) => {
        action(components);
        toast.error(error.message);
      });
  };

  return <ComponentSettingsForm data={settings} onChangeComponents={submit} />;
};

export default ComponentSettings;
