import { ComponentRef, useRef, useState } from 'react';
import { AnnouncementsSettingsData } from 'types/course/admin/announcements';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import AnnouncementsSettingsForm from './AnnouncementsSettingsForm';
import {
  fetchAnnouncementsSettings,
  updateAnnouncementsSettings,
} from './operations';

const AnnouncementsSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const formRef = useRef<ComponentRef<typeof AnnouncementsSettingsForm>>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: AnnouncementsSettingsData): void => {
    setSubmitting(true);

    updateAnnouncementsSettings(data)
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
    <Preload render={<LoadingIndicator />} while={fetchAnnouncementsSettings}>
      {(data): JSX.Element => (
        <AnnouncementsSettingsForm
          ref={formRef}
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default AnnouncementsSettings;
