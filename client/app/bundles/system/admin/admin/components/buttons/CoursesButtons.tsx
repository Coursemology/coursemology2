import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch, Operation } from 'types/store';
import { CourseMiniEntity } from 'types/system/courses';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import DeleteCoursePrompt from 'bundles/course/admin/pages/CourseSettings/DeleteCoursePrompt';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

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
        disabled={isDeleting}
        onClick={(): void => setOpenPrompt(true)}
        color="error"
      >
        <Delete />
      </IconButton>
      <DeleteCoursePrompt
        open={openPrompt}
        onClose={(): void => setOpenPrompt(false)}
        courseTitle={course.title}
        onConfirmDelete={handleDelete}
        disabled={isDeleting}
      />
    </div>
  );

  return managementButtons;
};

export default memo(injectIntl(CoursesButtons), (prevProps, nextProps) => {
  return equal(prevProps.course, nextProps.course);
});
