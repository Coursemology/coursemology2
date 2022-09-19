import { useState } from 'react';
import { toast } from 'react-toastify';

import { CourseInfo } from 'types/course/admin/course';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import suspend from 'lib/hooks/suspended';
import { FormEmitter } from 'lib/components/form/Form';
import CourseSettingsForm from './CourseSettingsForm';
import {
  deleteCourse,
  fetchCourseSettings,
  fetchTimeZones,
  updateCourseLogo,
  updateCourseSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';
import translations from './translations';

const settingsResource = suspend(fetchCourseSettings());
const timeZonesResource = suspend(fetchTimeZones());

const CourseSettings = (): JSX.Element => {
  const settings = settingsResource.read();
  const timeZones = timeZonesResource.read();
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();

  const updateFormAndToast = (
    data: CourseInfo | undefined,
    message: string,
  ): void => {
    if (!data) return;
    form?.resetTo?.(data);
    toast.success(message);
  };

  const submit = (data: CourseInfo): void => {
    updateCourseSettings(data)
      .then((newData) => {
        reloadOptions();
        updateFormAndToast(newData, t(formTranslations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const uploadCourseLogo = (files: File[]): void => {
    const file = files[0];
    updateCourseLogo(file)
      .then((newData) => {
        updateFormAndToast(newData, t(translations.courseLogoUpdated));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const handleDeleteCourse = (): void => {
    deleteCourse()
      .then(() => {
        toast.success(t(translations.deleteCourseSuccess));
        // TODO: Replace this with useNavigate()('/courses') once SPA
        window.location.replace('/courses');
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <CourseSettingsForm
      data={settings}
      timeZones={timeZones}
      emitsVia={setForm}
      onSubmit={submit}
      onUploadCourseLogo={uploadCourseLogo}
      onDeleteCourse={handleDeleteCourse}
    />
  );
};

export default CourseSettings;
