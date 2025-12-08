import { useState } from 'react';
import { Alert } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useSetLastSaved } from '../contexts';
import { createTimeline, updateTimeline } from '../operations';
import translations from '../translations';

interface CreateRenameTimelinePromptProps {
  open: boolean;
  onClose: () => void;
  renames?: TimelineData;
}

const isValidTitle = (title: string): boolean =>
  title !== '' && title.length < 255;

const CreateRenameTimelinePrompt = (
  props: CreateRenameTimelinePromptProps,
): JSX.Element => {
  const { renames: timeline } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [newTitle, setNewTitle] = useState(timeline?.title ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { startLoading, abortLoading, setLastSavedToNow } = useSetLastSaved();

  const isInvalidTitle = submitted && !isValidTitle(newTitle);

  const titleErrorText =
    newTitle.length >= 255
      ? t(formTranslations.characters)
      : t(translations.mustValidTimelineTitle);

  const resetPrompt = (): void => {
    setNewTitle(timeline?.title ?? '');
    setSubmitted(false);
  };

  const handleCreateTimeline = (): void => {
    setSubmitting(true);
    startLoading();

    dispatch(createTimeline(newTitle))
      .then(() => {
        props.onClose();
        setLastSavedToNow();
      })
      .catch((error) => {
        abortLoading();
        toast.error(
          error ?? t(translations.errorCreatingTimeline, { newTitle }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleRenameTimeline = (): void => {
    if (!timeline) throw new Error(`Trying to rename ${timeline} timeline.`);

    if (newTitle !== timeline.title) {
      startLoading();

      dispatch(updateTimeline(timeline.id, { title: newTitle }))
        .then(() => {
          props.onClose();
          setLastSavedToNow();
        })
        .catch((error) => {
          abortLoading();

          toast.error(
            error ?? t(translations.errorRenamingTimeline, { newTitle }),
          );
        });
    } else {
      props.onClose?.();
    }
  };

  const handleConfirmTitle = (): void => {
    setSubmitted(true);
    if (!isValidTitle(newTitle)) return;

    if (timeline) {
      handleRenameTimeline();
    } else {
      handleCreateTimeline();
    }
  };

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={submitting}
      onClickPrimary={handleConfirmTitle}
      onClose={props.onClose}
      onClosed={resetPrompt}
      open={props.open}
      primaryLabel={
        timeline
          ? t(translations.confirmRenameTimeline)
          : t(translations.confirmCreateTimeline)
      }
      title={
        timeline
          ? t(translations.renameTimelineTitle, { title: timeline.title ?? '' })
          : t(translations.newTimeline)
      }
    >
      <TextField
        autoFocus
        disabled={submitting}
        error={isInvalidTitle}
        fullWidth
        helperText={
          isInvalidTitle ? titleErrorText : t(translations.canChangeTitleLater)
        }
        label={t(translations.timelineTitle)}
        onChange={(e): void => setNewTitle(e.target.value)}
        onPressEnter={handleConfirmTitle}
        placeholder={timeline?.title}
        trims
        value={newTitle}
        variant="filled"
      />

      {!timeline && (
        <Alert severity="info">
          {t(translations.hintCanAddCustomTimes)}

          <ul className="m-0 mt-4 pl-6">
            <li>{t(translations.hintAssignedStudentsSeeCustomTimes)}</li>
            <li>{t(translations.hintAssignedStudentsSeeDefaultTimes)}</li>
          </ul>
        </Alert>
      )}
    </Prompt>
  );
};

export default CreateRenameTimelinePrompt;
