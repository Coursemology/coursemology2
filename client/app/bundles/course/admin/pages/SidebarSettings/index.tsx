import { useState } from 'react';
import { SidebarItems } from 'types/course/admin/sidebar';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchSidebarItems, updateSidebarItems } from './operations';
import SidebarSettingsForm from './SidebarSettingsForm';
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
    <Preload render={<LoadingIndicator />} while={fetchSidebarItems}>
      {(data): JSX.Element => (
        <SidebarSettingsForm
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default SidebarSettings;
