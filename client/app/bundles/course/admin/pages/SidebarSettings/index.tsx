import { useState } from 'react';
import { toast } from 'react-toastify';

import { SidebarItems } from 'types/course/admin/sidebar';
import useTranslation from 'lib/hooks/useTranslation';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Preload from 'lib/components/Preload';
import SidebarSettingsForm from './SidebarSettingsForm';
import { fetchSidebarItems, updateSidebarItems } from './operations';
import translations from './translations';

const SidebarSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (
    data: SidebarItems,
    onSuccess: (newData: SidebarItems) => void,
    onError: () => void,
  ): void => {
    setSubmitting(true);

    updateSidebarItems(data)
      .then((newData) => {
        if (!newData) return;
        onSuccess(newData);
        toast.success(t(translations.sidebarSettingsUpdated));
      })
      .catch(() => {
        onError();
        toast.error(t(translations.errorOccurredWhenUpdatingSidebar));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload while={fetchSidebarItems} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <SidebarSettingsForm
          data={data}
          onSubmit={handleSubmit}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default SidebarSettings;
