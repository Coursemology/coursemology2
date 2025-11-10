import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { loadAchievementCourseUsers } from '../../operations';
import { getAchievementEntity } from '../../selectors';

import AchievementAwardManager from './AchievementAwardManager';

interface Props {
  achievementId: number;
  open: boolean;
  handleClose: () => void;
}

const translations = defineMessages({
  awardAchievement: {
    id: 'course.achievement.AchievementAward.awardAchievement',
    defaultMessage: 'Award Achievement',
  },
});

const AchievementAward: FC<Props> = (props) => {
  const { achievementId, open, handleClose } = props;

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const achievement = useAppSelector((state) =>
    getAchievementEntity(state, achievementId),
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
          {`${t(translations.awardAchievement)} - ${achievement.title}`}
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

export default AchievementAward;
