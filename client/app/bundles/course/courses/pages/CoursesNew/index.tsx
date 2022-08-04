import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';

import { AppDispatch } from 'types/store';
import { NewCourseFormData } from 'types/course/courses';

import NewCourseForm from '../../components/forms/NewCourseForm';
import { createCourse } from '../../operations';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
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
  const { open, handleClose, intl } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const onSubmit = (data: NewCourseFormData, setError): Promise<void> =>
    dispatch(createCourse(data))
      .then((response) => {
        toast.success(intl.formatMessage(translations.courseCreationSuccess));
        setTimeout(() => {
          if (response.data?.id) {
            // TODO Change this to a react router after the courses home page has been implemented
            // Go to course page after creation
            window.location.href = `/courses/${response.data?.id}`;
          }
        }, 200);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.courseCreationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });

  return (
    <>
      <Dialog
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        maxWidth="lg"
        style={{
          top: 40,
        }}
      >
        <DialogTitle>{intl.formatMessage(translations.newCourse)}</DialogTitle>
        <DialogContent>
          <NewCourseForm
            onSubmit={onSubmit}
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(CoursesNew);
