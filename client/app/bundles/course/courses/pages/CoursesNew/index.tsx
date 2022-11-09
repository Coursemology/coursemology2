import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { NewCourseFormData } from 'types/course/courses';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import NewCourseForm from '../../components/forms/NewCourseForm';
import { createCourse } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
}
const translations = defineMessages({
  newCourse: {
    id: 'course.new',
    defaultMessage: 'New Course',
  },
  courseCreationSuccess: {
    id: 'course.create.success',
    defaultMessage: 'Course was created.',
  },
  courseCreationFailure: {
    id: 'course.create.fail',
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

  const dispatch = useDispatch<AppDispatch>();

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
