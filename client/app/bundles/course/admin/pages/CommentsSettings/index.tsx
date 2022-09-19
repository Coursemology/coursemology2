import { useState } from 'react';
import { toast } from 'react-toastify';

import { CommentsSettingsData } from 'types/course/admin/comments';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import suspend from 'lib/hooks/suspended';
import CommentsSettingsForm from './CommentsSettingsForm';
import { fetchCommentsSettings, updateCommentsSettings } from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const resource = suspend(fetchCommentsSettings());

const CommentsSettings = (): JSX.Element => {
  const settings = resource.read();
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = (data: CommentsSettingsData): void => {
    updateCommentsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <CommentsSettingsForm
      data={settings}
      onSubmit={handleSubmit}
      emitsVia={setForm}
    />
  );
};

export default CommentsSettings;
