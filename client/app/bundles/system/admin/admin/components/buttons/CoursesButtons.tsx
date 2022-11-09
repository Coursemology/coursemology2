import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import equal from 'fast-deep-equal';
import { AppDispatch, Operation } from 'types/store';
import { CourseMiniEntity } from 'types/system/courses';

import DeleteCoursePrompt from 'bundles/course/admin/pages/CourseSettings/DeleteCoursePrompt';

interface Props extends WrappedComponentProps {
  course: CourseMiniEntity;
  deleteOperation: (courseId: number) => Operation<void>;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.course.delete.success',
    defaultMessage: '{title} was deleted.',
  },
  deletionConfirm: {
    id: 'system.admin.course.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {title}?',
  },
  deletionFailure: {
    id: 'system.admin.course.delete.failure',
    defaultMessage: '{title} failed to be deleted - {error}',
  },
});

const CoursesButtons: FC<Props> = (props) => {
  const { intl, course, deleteOperation } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [openPrompt, setOpenPrompt] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteOperation(course.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.deletionSuccess, {
            title: course.title,
          }),
        );
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            title: course.title,
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div key={`buttons-${course.id}`}>
      <IconButton
        className={`course-delete-${course.id} p-0`}
        color="error"
        disabled={isDeleting}
        onClick={(): void => setOpenPrompt(true)}
      >
        <Delete />
      </IconButton>
      <DeleteCoursePrompt
        courseTitle={course.title}
        disabled={isDeleting}
        onClose={(): void => setOpenPrompt(false)}
        onConfirmDelete={handleDelete}
        open={openPrompt}
      />
    </div>
  );

  return managementButtons;
};

export default memo(injectIntl(CoursesButtons), (prevProps, nextProps) => {
  return equal(prevProps.course, nextProps.course);
});
