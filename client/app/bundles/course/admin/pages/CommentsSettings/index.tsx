import { ComponentRef, useRef, useState } from 'react';
import { CommentsSettingsData } from 'types/course/admin/comments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
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
  const formRef = useRef<ComponentRef<typeof CommentsSettingsForm>>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: CommentsSettingsData): void => {
    setSubmitting(true);

    updateCommentsSettings(data)
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
    <Preload render={<LoadingIndicator />} while={fetchCommentsSettings}>
      {(data): JSX.Element => (
        <CommentsSettingsForm
          ref={formRef}
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default CommentsSettings;
