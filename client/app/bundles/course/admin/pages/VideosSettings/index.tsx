import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import VideosSettingsForm from './VideosSettingsForm';
import {
  createTab,
  deleteTab,
  fetchVideosSettings,
  updateVideosSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';
import commonTranslations from '../../translations';

const VideosSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<VideosSettingsData>();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVideosSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

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
        reloadOptions();
        updateFormAndToast(newData, t(translations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
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
      .catch((error: Error) => {
        toast.error(error.message);
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
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <VideosSettingsForm
      data={settings}
      emitsVia={setForm}
      onSubmit={handleSubmit}
      onCreateTab={handleCreateTab}
      onDeleteTab={handleDeleteTab}
      canCreateTabs={settings.canCreateTabs}
      disabled={submitting}
    />
  );
};

export default VideosSettings;
