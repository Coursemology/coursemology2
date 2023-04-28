import { useState } from 'react';
import { toast } from 'react-toastify';
import { AnnouncementsSettingsData } from 'types/course/admin/announcements';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
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
  const [form, setForm] = useState<FormEmitter<AnnouncementsSettingsData>>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: AnnouncementsSettingsData): void => {
    setSubmitting(true);

    updateAnnouncementsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadItems();
        toast.success(t(translations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAnnouncementsSettings}>
      {(data): JSX.Element => (
        <AnnouncementsSettingsForm
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default AnnouncementsSettings;
