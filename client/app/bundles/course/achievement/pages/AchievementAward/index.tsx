import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { loadAchievementCourseUsers } from '../../operations';
import { getAchievementEntity } from '../../selectors';

import AchievementAwardManager from './AchievementAwardManager';

interface Props extends WrappedComponentProps {
  achievementId: number;
  open: boolean;
  handleClose: () => void;
}

const translations = defineMessages({
  awardAchievement: {
    id: 'course.achievement.awardAchievement',
    defaultMessage: 'Award Achievement',
  },
});

const AchievementAward: FC<Props> = (props) => {
  const { achievementId, open, handleClose, intl } = props;

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const achievement = useSelector((state: AppState) =>
    getAchievementEntity(state, achievementId),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (achievementId && open) {
      setIsLoading(true);
      dispatch(loadAchievementCourseUsers(+achievementId)).finally(() =>
        setIsLoading(false),
      );
    }
  }, [achievementId, dispatch, open]);

  if (!open) {
    return null;
  }

  if (!achievement) {
    return null;
  }

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={(): void => {
          if (isDirty) {
            setDiscardDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        style={{
          top: 40,
        }}
      >
        <DialogTitle>
          {`${intl.formatMessage(translations.awardAchievement)} - ${
            achievement.title
          }`}
        </DialogTitle>
        <DialogContent>
          <AchievementAwardManager
            achievement={achievement}
            handleClose={(skipDialog: boolean): void => {
              if (isDirty && !skipDialog) {
                setDiscardDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            isLoading={isLoading}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        onCancel={(): void => setDiscardDialogOpen(false)}
        onConfirm={(): void => {
          setDiscardDialogOpen(false);
          handleClose();
        }}
        open={discardDialogOpen}
      />
    </>
  );
};

export default injectIntl(AchievementAward);
