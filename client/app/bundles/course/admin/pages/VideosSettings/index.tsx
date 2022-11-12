import { useState } from 'react';
import { toast } from 'react-toastify';
import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';
import commonTranslations from '../../translations';

import {
  createTab,
  deleteTab,
  fetchVideosSettings,
  updateVideosSettings,
} from './operations';
import translations from './translations';
import VideosSettingsForm from './VideosSettingsForm';

const VideosSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  const updateFormAndToast = (
    data: VideosSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    form?.resetTo?.(data);
    toast.success(message);
  };

  const handleSubmit = (data: VideosSettingsData): void => {
    setSubmitting(true);

    updateVideosSettings(data)
      .then((newData) => {
        reloadItems();
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  const handleCreateTab = (
    title: VideosTab['title'],
    weight: VideosTab['weight'],
  ): void => {
    setSubmitting(true);

    createTab(title, weight)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.created, { title }));
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenCreatingTab));
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteTab = (
    id: VideosTab['id'],
    title: VideosTab['title'],
  ): void => {
    setSubmitting(true);

    deleteTab(id)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenDeletingTab));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchVideosSettings}>
      {(data): JSX.Element => (
        <VideosSettingsForm
          canCreateTabs={data.canCreateTabs}
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onCreateTab={handleCreateTab}
          onDeleteTab={handleDeleteTab}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default VideosSettings;
