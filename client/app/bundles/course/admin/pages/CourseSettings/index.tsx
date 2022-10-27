import { useState } from 'react';
import { toast } from 'react-toastify';

import { CourseInfo, TimeZones } from 'types/course/admin/course';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
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

const fetchSettingsAndTimeZones = (): Promise<[CourseInfo, TimeZones]> =>
  Promise.all([fetchCourseSettings(), fetchTimeZones()]);

const CourseSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (data?: CourseInfo): void => {
    if (!data) return;
    form?.resetTo?.(data);
  };

  const updateFormAndToast = (message: string, data?: CourseInfo): void => {
    updateForm(data);
    toast.success(message);
  };

  const handleSubmit = (data: CourseInfo): void => {
    setSubmitting(true);

    updateCourseSettings(data)
      .then((newData) => {
        reloadOptions();
        updateFormAndToast(t(formTranslations.changesSaved), newData);
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  const handleUploadCourseLogo = (image: File, onSuccess: () => void): void => {
    setSubmitting(true);

    toast
      .promise(updateCourseLogo(image), {
        pending: t(translations.uploadingLogo),
        success: t(translations.courseLogoUpdated),
      })
      .then((newData) => {
        updateForm(newData);
        onSuccess();
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteCourse = (): void => {
    setSubmitting(true);

    deleteCourse()
      .then(() => {
        toast.success(t(translations.deleteCourseSuccess));
        // TODO: Replace this with useNavigate()('/courses') once SPA
        window.location.replace('/courses');
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenDeletingCourse));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload while={fetchSettingsAndTimeZones} render={<LoadingIndicator />}>
      {([settings, timeZones]): JSX.Element => (
        <CourseSettingsForm
          data={settings}
          timeZones={timeZones}
          emitsVia={setForm}
          onSubmit={handleSubmit}
          onUploadCourseLogo={handleUploadCourseLogo}
          onDeleteCourse={handleDeleteCourse}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default CourseSettings;
