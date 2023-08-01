import { useState } from 'react';
import { CommentsSettingsData } from 'types/course/admin/comments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import CommentsSettingsForm from './CommentsSettingsForm';
import { fetchCommentsSettings, updateCommentsSettings } from './operations';

const CommentsSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter<CommentsSettingsData>>();
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
    <Preload render={<LoadingIndicator />} while={fetchCommentsSettings}>
      {(data): JSX.Element => (
        <CommentsSettingsForm
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default CommentsSettings;
