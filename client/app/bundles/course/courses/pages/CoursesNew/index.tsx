import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { NewCourseFormData } from 'types/course/courses';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import NewCourseForm from '../../components/forms/NewCourseForm';
import { createCourse } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
}
const translations = defineMessages({
  newCourse: {
    id: 'course.courses.CoursesNew.new',
    defaultMessage: 'New Course',
  },
  courseCreationSuccess: {
    id: 'course.courses.CoursesNew.courseCreationSuccess',
    defaultMessage: 'Course was created.',
  },
  courseCreationFailure: {
    id: 'course.courses.CoursesNew.courseCreationFailure',
    defaultMessage: 'Failed to create course.',
  },
});

const initialValues = {
  title: '',
  description: '',
};

const CoursesNew: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const onSubmit = (data: NewCourseFormData, setError): Promise<void> =>
    dispatch(createCourse(data))
      .then((response) => {
        toast.success(t(translations.courseCreationSuccess));
        setTimeout(() => {
          if (response.data?.id) {
            // TODO Change this to a react router after the courses home page has been implemented
            // Go to course page after creation
            window.location.href = `/courses/${response.data?.id}`;
          }
        }, 200);
      })
      .catch((error) => {
        toast.error(t(translations.courseCreationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });

  return (
    <NewCourseForm
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.newCourse)}
    />
  );
};

export default CoursesNew;
