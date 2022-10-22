import { useState } from 'react';
import { toast } from 'react-toastify';

import { AssessmentSettingsData } from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import AssessmentSettingsForm from './AssessmentSettingsForm';
import {
  updateAssessmentSettings,
  deleteCategory,
  deleteTabInCategory,
  createTabInCategory,
  createCategory,
  fetchAssessmentsSettings,
  moveAssessments,
  moveTabs,
} from './operations';
import commonTranslations from '../../translations';
import {
  AssessmentSettingsContextType,
  AssessmentSettingsProvider,
} from './AssessmentSettingsContext';
import translations from './translations';

interface LoadedAssessmentSettingsProps {
  data: AssessmentSettingsData;
}

const LoadedAssessmentSettings = (
  props: LoadedAssessmentSettingsProps,
): JSX.Element | null => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [settings, setSettings] = useState(props.data);
  const [submitting, setSubmitting] = useState(false);

  const updateFormAndToast = (
    data: AssessmentSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    setSettings(data);
    form?.resetTo?.(data);
    toast.success(message);
  };

  const handleSubmit = (data: AssessmentSettingsData): void => {
    setSubmitting(true);

    updateAssessmentSettings(data)
      .then((newData) => {
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  const assessmentSettings: AssessmentSettingsContextType = {
    settings,
    createCategory: (title, weight) => {
      setSubmitting(true);

      createCategory(title, weight)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.created, { title }));
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenCreatingCategory));
        })
        .finally(() => setSubmitting(false));
    },
    createTabInCategory: (id, title, weight) => {
      setSubmitting(true);

      createTabInCategory(id, title, weight)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.created, { title }));
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenCreatingTab));
        })
        .finally(() => setSubmitting(false));
    },
    deleteCategory: (id, title) => {
      setSubmitting(true);

      deleteCategory(id)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenDeletingCategory));
        })
        .finally(() => setSubmitting(false));
    },
    deleteTabInCategory: (id, tabId, title) => {
      setSubmitting(true);

      deleteTabInCategory(id, tabId)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenDeletingTab));
        })
        .finally(() => setSubmitting(false));
    },
    moveAssessments: (
      sourceTabId,
      destinationTabId,
      destinationTabTitle,
      onSuccess,
      onError,
    ) => {
      setSubmitting(true);

      moveAssessments(sourceTabId, destinationTabId)
        .then((count) => {
          toast.success(
            t(translations.nAssessmentsMoved, {
              n: count.toString(),
              tab: destinationTabTitle,
            }),
          );

          onSuccess?.();
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenMovingAssessments));
          onError?.();
          setSubmitting(false);
        });
    },
    moveTabs: (
      sourceCategoryId,
      destinationCategoryId,
      destinationCategoryTitle,
      onSuccess,
      onError,
    ) => {
      setSubmitting(true);

      moveTabs(sourceCategoryId, destinationCategoryId)
        .then((count) => {
          toast.success(
            t(translations.nTabsMoved, {
              n: count.toString(),
              category: destinationCategoryTitle,
            }),
          );

          onSuccess?.();
        })
        .catch(() => {
          toast.error(t(translations.errorOccurredWhenMovingTabs));
          onError?.();
          setSubmitting(false);
        });
    },
  };

  return (
    <AssessmentSettingsProvider value={assessmentSettings}>
      <AssessmentSettingsForm
        data={settings}
        emitsVia={setForm}
        onSubmit={handleSubmit}
        disabled={submitting}
      />
    </AssessmentSettingsProvider>
  );
};

const AssessmentSettings = (): JSX.Element => (
  <Preload while={fetchAssessmentsSettings} render={<LoadingIndicator />}>
    {(data): JSX.Element => <LoadedAssessmentSettings data={data} />}
  </Preload>
);

export default AssessmentSettings;
