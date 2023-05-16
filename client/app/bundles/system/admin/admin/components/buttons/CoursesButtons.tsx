import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import equal from 'fast-deep-equal';
import { Operation } from 'store';
import { CourseMiniEntity } from 'types/system/courses';

import DeleteCoursePrompt from 'bundles/course/admin/pages/CourseSettings/DeleteCoursePrompt';
import { useAppDispatch } from 'lib/hooks/store';

interface Props extends WrappedComponentProps {
  course: CourseMiniEntity;
  deleteOperation: (courseId: number) => Operation;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.admin.CourseButtons.deletionSuccess',
    defaultMessage: '{title} was deleted.',
  },
  deletionConfirm: {
    id: 'system.admin.admin.CourseButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete {title}?',
  },
  deletionFailure: {
    id: 'system.admin.admin.CourseButtons.deletionFailure',
    defaultMessage: '{title} failed to be deleted - {error}',
  },
});

const CoursesButtons: FC<Props> = (props) => {
  const { intl, course, deleteOperation } = props;
  const dispatch = useAppDispatch();
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

  return (
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
};

export default memo(injectIntl(CoursesButtons), (prevProps, nextProps) => {
  return equal(prevProps.course, nextProps.course);
});
