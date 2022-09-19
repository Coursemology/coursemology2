import { useState } from 'react';
import { toast } from 'react-toastify';

import {
  AssessmentCategory,
  AssessmentSettingsData,
  AssessmentTab,
} from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import suspend from 'lib/hooks/suspended';
import AssessmentSettingsForm from './AssessmentSettingsForm';
import {
  updateAssessmentSettings,
  deleteCategory,
  deleteTabInCategory,
  createTabInCategory,
  createCategory,
  fetchAssessmentsSettings,
} from './operations';
import commonTranslations from '../../translations';

const resource = suspend(fetchAssessmentsSettings());

const AssessmentSettings = (): JSX.Element => {
  const settings = resource.read();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

  const updateFormAndToast = (
    data: AssessmentSettingsData | undefined,
    message: string,
  ): void => {
    if (!data) return;
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

  const handleDeleteCategory = (
    id: AssessmentCategory['id'],
    title: AssessmentCategory['title'],
  ): void => {
    deleteCategory(id)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleDeleteTabInCategory = (
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ): void => {
    deleteTabInCategory(id, tabId)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.deleted, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleCreateCategory = (
    title: AssessmentCategory['title'],
    weight: AssessmentCategory['weight'],
  ): void => {
    createCategory(title, weight)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.created, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleCreateTabInCategory = (
    id: AssessmentCategory['id'],
    title: AssessmentTab['title'],
    weight: AssessmentTab['weight'],
  ): void => {
    createTabInCategory(id, title, weight)
      .then((newData) => {
        updateFormAndToast(newData, t(commonTranslations.created, { title }));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <AssessmentSettingsForm
      data={settings}
      emitsVia={setForm}
      onSubmit={submit}
      onDeleteCategory={handleDeleteCategory}
      onDeleteTabInCategory={handleDeleteTabInCategory}
      onCreateCategory={handleCreateCategory}
      onCreateTabInCategory={handleCreateTabInCategory}
    />
  );
};

export default AssessmentSettings;
