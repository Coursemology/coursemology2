import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { CourseInfo, TimeZones } from 'types/course/admin/course';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
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

const CourseSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<CourseInfo>();
  const [timeZones, setTimeZones] = useState<TimeZones>();
  const [form, setForm] = useState<FormEmitter>();

  useEffect(() => {
    fetchCourseSettings().then(setSettings);
    fetchTimeZones().then(setTimeZones);
  }, []);

  if (!settings || !timeZones) return <LoadingIndicator />;

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

  const uploadCourseLogo = (file: File, onSuccess: () => void): void => {
    toast
      .promise(updateCourseLogo(file), {
        pending: t(translations.uploadingLogo),
        success: t(translations.courseLogoUpdated),
      })
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        onSuccess();
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
