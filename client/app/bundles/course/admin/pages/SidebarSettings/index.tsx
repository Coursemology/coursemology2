import { toast } from 'react-toastify';

import { SidebarItems } from 'types/course/admin/sidebar';
import useTranslation from 'lib/hooks/useTranslation';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useState, useEffect } from 'react';
import SidebarSettingsForm from './SidebarSettingsForm';
import { fetchSidebarItems, updateSidebarItems } from './operations';
import translations from './translations';

const SidebarSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SidebarItems>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSidebarItems().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const handleSubmit = (
    data: SidebarItems,
    action: (newData: SidebarItems) => void,
  ): void => {
    setSubmitting(true);

    updateSidebarItems(data)
      .then((newData) => {
        if (!newData) return;
        action(newData);
        toast.success(t(translations.sidebarSettingsUpdated));
      })
      .catch((error: Error) => {
        action(data);
        toast.error(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <SidebarSettingsForm
      data={settings}
      onSubmit={handleSubmit}
      disabled={submitting}
    />
  );
};

export default SidebarSettings;
