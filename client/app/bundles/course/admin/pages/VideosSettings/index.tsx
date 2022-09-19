import { useState } from 'react';
import { toast } from 'react-toastify';

import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import suspend from 'lib/hooks/suspended';
import VideosSettingsForm from './VideosSettingsForm';
import {
  createTab,
  deleteTab,
  fetchVideosSettings,
  updateVideosSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';
import commonTranslations from '../../translations';

const resource = suspend(fetchVideosSettings());

const VideosSettings = (): JSX.Element => {
  const settings = resource.read();
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

  const updateFormAndToast = (
    data: VideosSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    form?.resetTo?.(data);
    toast.success(message);
  };

  const submit = (data: VideosSettingsData): void => {
    updateVideosSettings(data)
      .then((newData) => {
        reloadOptions();
        updateFormAndToast(newData, t(translations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleCreateTab = (
    title: VideosTab['title'],
    weight: VideosTab['weight'],
  ): void => {
    createTab(title, weight)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.created, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleDeleteTab = (
    id: VideosTab['id'],
    title: VideosTab['title'],
  ): void => {
    deleteTab(id)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <VideosSettingsForm
      data={settings}
      emitsVia={setForm}
      onSubmit={submit}
      onCreateTab={handleCreateTab}
      onDeleteTab={handleDeleteTab}
      canCreateTabs={settings.canCreateTabs}
    />
  );
};

export default VideosSettings;
