import { useState } from 'react';
import { toast } from 'react-toastify';

import { CommentsSettingsData } from 'types/course/admin/comments';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import CommentsSettingsForm from './CommentsSettingsForm';
import { fetchCommentsSettings, updateCommentsSettings } from './operations';
import { useItemsReloader } from '../../components/SettingsNavigation';

const CommentsSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: CommentsSettingsData): void => {
    setSubmitting(true);

    updateCommentsSettings(data)
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
    <Preload while={fetchCommentsSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <CommentsSettingsForm
          data={data}
          onSubmit={handleSubmit}
          emitsVia={setForm}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default CommentsSettings;
