import { useState } from 'react';
import { toast } from 'react-toastify';

import { AssessmentSettingsData } from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import useSuspendedFetch from 'lib/hooks/useSuspendedFetch';
import AssessmentSettingsForm from './AssessmentSettingsForm';
import {
  updateAssessmentSettings,
  deleteCategory,
  deleteTabInCategory,
  createTabInCategory,
  createCategory,
  fetchAssessmentsSettings,
  moveAssessmentsToTab,
} from './operations';
import commonTranslations from '../../translations';
import {
  AssessmentSettingsContextType,
  AssessmentSettingsProvider,
} from './AssessmentSettingsContext';
import translations from './translations';

const AssessmentSettings = (): JSX.Element => {
  const { data: settings, update } = useSuspendedFetch(
    fetchAssessmentsSettings,
  );
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

  const updateFormAndToast = (
    data: AssessmentSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
    update(data);
    form?.resetTo?.(data);
    toast.success(message);
  };

  const submit = (data: AssessmentSettingsData): void => {
    updateAssessmentSettings(data)
      .then((newData) => {
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const assessmentSettings: AssessmentSettingsContextType = {
    settings,
    createCategory: (title, weight) => {
      createCategory(title, weight)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.created, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    createTabInCategory: (id, title, weight) => {
      createTabInCategory(id, title, weight)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.created, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    deleteCategory: (id, title) => {
      deleteCategory(id)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    deleteTabInCategory: (id, tabId, title) => {
      deleteTabInCategory(id, tabId)
        .then((newData) => {
          updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    moveAssessmentsToTab: (assessmentIds, tabId, fullTabTitle) =>
      toast.promise(moveAssessmentsToTab(assessmentIds, tabId), {
        pending: t(translations.movingAssessmentsTo, { tab: fullTabTitle }),
        success: t(translations.nAssessmentsMoved, {
          n: assessmentIds.length.toString(),
          tab: fullTabTitle,
        }),
        error: t(translations.errorWhenMovingAssessments, {
          tab: fullTabTitle,
        }),
      }),
  };

  return (
    <AssessmentSettingsProvider value={assessmentSettings}>
      <AssessmentSettingsForm
        data={settings}
        emitsVia={setForm}
        onSubmit={submit}
      />
    </AssessmentSettingsProvider>
  );
};

export default AssessmentSettings;
