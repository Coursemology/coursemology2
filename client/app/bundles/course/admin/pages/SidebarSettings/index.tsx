import { toast } from 'react-toastify';

import { SidebarItems } from 'types/course/admin/sidebar';
import useTranslation from 'lib/hooks/useTranslation';
import suspend from 'lib/hooks/suspended';
import SidebarSettingsForm from './SidebarSettingsForm';
import { fetchSidebarItems, updateSidebarItems } from './operations';
import translations from './translations';

const resource = suspend(fetchSidebarItems());

const SidebarSettings = (): JSX.Element => {
  const settings = resource.read();
  const { t } = useTranslation();

  const submit = (
    data: SidebarItems,
    action: (newData: SidebarItems) => void,
  ): void => {
    updateSidebarItems(data)
      .then((newData) => {
        if (!newData) return;
        action(newData);
        toast.success(t(translations.sidebarSettingsUpdated));
      })
      .catch((error: Error) => {
        action(data);
        toast.error(error.message);
      });
  };

  return <SidebarSettingsForm data={settings} onSubmit={submit} />;
};

export default SidebarSettings;
