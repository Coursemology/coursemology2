import { ComponentRef, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseInfo, TimeOffset, TimeZones } from 'types/course/admin/course';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import CourseSettingsForm from './CourseSettingsForm';
import {
  deleteCourse,
  fetchCourseSettings,
  fetchTimeZones,
  suspendCourse,
  unsuspendCourse,
  updateCourseLogo,
  updateCourseSettings,
} from './operations';
import translations from './translations';

const fetchSettingsAndTimeZones = (): Promise<[CourseInfo, TimeZones]> =>
  Promise.all([fetchCourseSettings(), fetchTimeZones()]);

const CourseSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const formRef = useRef<ComponentRef<typeof CourseSettingsForm>>(null);
  const [reloadForm, setReloadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const updateForm = (data?: CourseInfo): void => {
    if (!data) return;
    formRef.current?.resetTo?.(data);
  };

  const updateFormAndToast = (message: string, data?: CourseInfo): void => {
    updateForm(data);
    toast.success(message);
  };

  const handleSubmit = (data: CourseInfo, timeOffset?: TimeOffset): void => {
    setSubmitting(true);

    updateCourseSettings(data, timeOffset)
      .then((newData) => {
        reloadItems();
        updateFormAndToast(t(formTranslations.changesSaved), newData);
        setReloadForm((value) => !value);
      })
      .catch(formRef.current?.receiveErrors)
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
        navigate('/courses');
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenDeletingCourse));
      })
      .finally(() => setSubmitting(false));
  };

  const handleSuspendCourse = (): void => {
    setSubmitting(true);

    suspendCourse()
      .then(() => {
        formRef.current?.resetByMerging?.({ isSuspended: true });
        toast.success(t(translations.suspendCourseSuccess));
        setReloadForm((value) => !value);
      })
      .catch(() => {
        toast.error(t(translations.suspendCourseFailure));
      })
      .finally(() => setSubmitting(false));
  };

  const handleUnsuspendCourse = (): void => {
    setSubmitting(true);

    unsuspendCourse()
      .then(() => {
        formRef.current?.resetByMerging?.({ isSuspended: false });
        toast.success(t(translations.unsuspendCourseSuccess));
        setReloadForm((value) => !value);
      })
      .catch(() => {
        toast.error(t(translations.unsuspendCourseFailure));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      syncsWith={[reloadForm]}
      while={fetchSettingsAndTimeZones}
    >
      {([settings, timeZones]): JSX.Element => (
        <CourseSettingsForm
          ref={formRef}
          data={settings}
          disabled={submitting}
          onDeleteCourse={handleDeleteCourse}
          onSubmit={handleSubmit}
          onSuspendCourse={handleSuspendCourse}
          onUnsuspendCourse={handleUnsuspendCourse}
          onUploadCourseLogo={handleUploadCourseLogo}
          timeZones={timeZones}
        />
      )}
    </Preload>
  );
};

export default CourseSettings;
