import { ComponentRef, useRef, useState } from 'react';
import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
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
  const formRef = useRef<ComponentRef<typeof VideosSettingsForm>>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateFormAndToast = (
    data: VideosSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    formRef.current?.resetTo?.(data);
    toast.success(message);
  };

  const handleSubmit = (data: VideosSettingsData): void => {
    setSubmitting(true);

    updateVideosSettings(data)
      .then((newData) => {
        reloadItems();
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch(formRef.current?.receiveErrors)
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
          ref={formRef}
          canCreateTabs={data.canCreateTabs}
          data={data}
          disabled={submitting}
          onCreateTab={handleCreateTab}
          onDeleteTab={handleDeleteTab}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default VideosSettings;
