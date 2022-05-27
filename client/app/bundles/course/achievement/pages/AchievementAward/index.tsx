import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { AppDispatch, AppState } from 'types/store';
import AchievementAwardManager from './AchievementAwardManager';
import { loadAchievementCourseUsers } from '../../operations';
import { getAchievementEntity } from '../../selectors';

interface Props {
  achievementId: number;
  open: boolean;
  handleClose: () => any;
  intl?: any;
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
        onClose={(): void => {
          if (isDirty) {
            setDiscardDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        fullWidth
        maxWidth="lg"
        style={{
          position: 'absolute',
          top: 50,
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
            isLoading={isLoading}
            handleClose={(skipDialog: boolean): void => {
              if (isDirty && !skipDialog) {
                setDiscardDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={discardDialogOpen}
        onCancel={(): void => setDiscardDialogOpen(false)}
        onConfirm={(): void => {
          setDiscardDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(AchievementAward);
