import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AppDispatch } from 'types/store';
import { AchievementFormData } from 'types/course/achievements';
import { getAchievementURL } from 'lib/helpers/url-builders';
import AchievementForm from '../../components/forms/AchievementForm';
import { createAchievement } from '../../operations';

type Props = {
  open: boolean;
  handleClose: () => any;
} & WrappedComponentProps;

const translations = defineMessages({
  newAchievement: {
    id: 'course.achievement.newAchievement',
    defaultMessage: 'New Achievement',
  },
  creationSuccess: {
    id: 'course.achievement.create.success',
    defaultMessage: 'Achievement was created.',
  },
  creationFailure: {
    id: 'course.achievement.create.fail',
    defaultMessage: 'Failed to create achievement.',
  },
});

const initialValues = {
  title: '',
  description: '',
  published: false,
  badge: { name: '', url: '', file: undefined }, // TODO: Pass url for local achievement_blank.png asset
};

const AchievementNew: FC<Props> = (props) => {
  const { open, handleClose, intl } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  const onSubmit = (data: AchievementFormData, setError): Promise<void> =>
    dispatch(createAchievement(data))
      .then((response) => {
        toast.success(intl.formatMessage(translations.creationSuccess));
        setTimeout(() => {
          if (response.data?.id) {
            navigate(getAchievementURL(getCourseId(), response.data.id));
          }
        }, 200);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.creationFailure));
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
        maxWidth="xl"
      >
        <DialogTitle>
          {intl.formatMessage(translations.newAchievement)}
        </DialogTitle>
        <DialogContent>
          <AchievementForm
            editing={false}
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            onSubmit={onSubmit}
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

export default injectIntl(AchievementNew);
