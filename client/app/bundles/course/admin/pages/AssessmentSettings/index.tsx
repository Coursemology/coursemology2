import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { AssessmentSettingsData } from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
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

const AssessmentSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [settings, setSettings] = useState<AssessmentSettingsData>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessmentsSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

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
      .catch((error: Error) => {
        toast.error(error.message);
      })
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
        .catch((error: Error) => {
          toast.error(error.message);
        })
        .finally(() => setSubmitting(false));
    },
    createTabInCategory: (id, title, weight) => {
      setSubmitting(true);

      createTabInCategory(id, title, weight)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.created, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        })
        .finally(() => setSubmitting(false));
    },
    deleteCategory: (id, title) => {
      setSubmitting(true);

      deleteCategory(id)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        })
        .finally(() => setSubmitting(false));
    },
    deleteTabInCategory: (id, tabId, title) => {
      setSubmitting(true);

      deleteTabInCategory(id, tabId)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
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
        })
        .finally(() => setSubmitting(false));

      setSubmitting(false);
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
        })
        .finally(() => setSubmitting(false));

      setSubmitting(false);
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

export default AssessmentSettings;
