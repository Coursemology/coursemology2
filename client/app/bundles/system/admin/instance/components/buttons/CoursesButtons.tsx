import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import { CourseMiniEntity } from 'types/system/courses';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { deleteCourse } from '../../operations';

interface Props extends WrappedComponentProps {
  course: CourseMiniEntity;
}

const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.instance.course.delete.success',
    defaultMessage: '{title} was deleted.',
  },
  deletionConfirm: {
    id: 'system.admin.instance.course.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {title}?',
  },
  deletionFailure: {
    id: 'system.admin.instance.course.delete.failure',
    defaultMessage: '{title} failed to be deleted - {error}',
  },
});

const CourseManagementButtons: FC<Props> = (props) => {
  const { intl, course } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteCourse(course.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.deletionSuccess, {
            title: course.title,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            title: course.title,
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${course.id}`}>
      <DeleteButton
        tooltip="Delete Course"
        className={`course-delete-${course.id}`}
        disabled={isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          title: course.title,
        })}
        sx={styles.buttonStyle}
      />
    </div>
  );

  return managementButtons;
};

export default memo(
  injectIntl(CourseManagementButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.course, nextProps.course);
  },
);
