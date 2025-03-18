import { ComponentRef, useRef, useState } from 'react';
import { AssessmentSettingsData } from 'types/course/admin/assessments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import commonTranslations from '../../translations';

import {
  AssessmentSettingsContextType,
  AssessmentSettingsProvider,
} from './AssessmentSettingsContext';
import AssessmentSettingsForm from './AssessmentSettingsForm';
import {
  createCategory,
  createTabInCategory,
  deleteCategory,
  deleteTabInCategory,
  fetchAssessmentsSettings,
  moveAssessments,
  moveTabs,
  updateAssessmentSettings,
} from './operations';
import translations from './translations';

interface LoadedAssessmentSettingsProps {
  data: AssessmentSettingsData;
}

const LoadedAssessmentSettings = (
  props: LoadedAssessmentSettingsProps,
): JSX.Element | null => {
  const { t } = useTranslation();
  const formRef = useRef<ComponentRef<typeof AssessmentSettingsForm>>(null);
  const [settings, setSettings] = useState(props.data);
  const [submitting, setSubmitting] = useState(false);

  const updateFormAndToast = (
    data: AssessmentSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    setSettings(data);
    formRef.current?.resetTo?.(data);
    toast.success(message);
  };

  const handleSubmit = (data: AssessmentSettingsData): void => {
    setSubmitting(true);

    updateAssessmentSettings(data)
      .then((newData) => {
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch(formRef.current?.receiveErrors)
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
        ref={formRef}
        data={settings}
        disabled={submitting}
        onSubmit={handleSubmit}
      />
    </AssessmentSettingsProvider>
  );
};

const AssessmentSettings = (): JSX.Element => (
  <Preload render={<LoadingIndicator />} while={fetchAssessmentsSettings}>
    {(data): JSX.Element => <LoadedAssessmentSettings data={data} />}
  </Preload>
);

export default AssessmentSettings;
