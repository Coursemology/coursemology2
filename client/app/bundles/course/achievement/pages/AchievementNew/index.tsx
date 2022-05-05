import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { AppDispatch } from 'types/store';
import { AchievementFormData } from 'types/course/achievements';
import AchievementForm from '../../components/forms/AchievementForm';
import { createAchievement } from '../../operations';

interface OwnProps {
  open: boolean;
  handleClose: () => any;
  intl?: any;
}

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

const AchievementNew: FC<OwnProps> = (props) => {
  const { open, handleClose, intl } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  const onSubmit = (data: AchievementFormData, setError) =>
    dispatch(
      createAchievement(
        data,
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
        setError,
        navigate,
      ),
    );

  return (
    <>
      <Dialog
        onClose={() => {
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
            handleClose={() => {
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
        onCancel={() => setConfirmationDialogOpen(false)}
        onConfirm={() => {
          setConfirmationDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(AchievementNew);
