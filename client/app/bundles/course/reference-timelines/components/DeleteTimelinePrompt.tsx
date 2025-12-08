import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { selectTimelines } from '../selectors';
import translations from '../translations';

interface DeleteTimelinePromptProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: (alternativeTimelineId?: TimelineData['id']) => void;
  deletes: TimelineData;
  disabled?: boolean;
}

const DeleteTimelinePrompt = (
  props: DeleteTimelinePromptProps,
): JSX.Element => {
  const { deletes: timeline } = props;

  const { t } = useTranslation();

  const timelines = useAppSelector(selectTimelines);

  const [primaryButton, setPrimaryButton] = useState<HTMLButtonElement>();

  return (
    <>
      <Prompt
        contentClassName="space-y-4"
        disabled={props.disabled}
        onClickPrimary={
          timeline.assignees
            ? (e): void => setPrimaryButton(e.currentTarget)
            : (): void => props.onConfirmDelete()
        }
        onClose={props.onClose}
        open={props.open}
        primaryColor="error"
        primaryLabel={
          timeline.assignees
            ? t(translations.confirmRevertAndDeleteTimeline)
            : t(translations.confirmDeleteTimeline)
        }
        title={t(translations.sureDeletingTimeline, {
          title: timeline.title ?? '',
        })}
      >
        {Boolean(timeline.timesCount) && (
          <PromptText>
            {t(translations.timelineHasNTimes, { n: timeline.timesCount })}
          </PromptText>
        )}

        {Boolean(timeline.assignees) && (
          <PromptText>
            {t(translations.timelineHasNStudents, { n: timeline.assignees! })}
          </PromptText>
        )}

        <PromptText>
          {Boolean(timeline.timesCount) &&
            `${t(translations.hintDeletingTimelineWillRemoveTimes)} `}

          {t(translations.hintDeletingTimelineWillNotAffectSubmissions)}
        </PromptText>

        {Boolean(timeline.assignees) && (
          <PromptText>
            {t(translations.hintChooseAlternativeTimeline)}
          </PromptText>
        )}
      </Prompt>

      <Menu
        anchorEl={primaryButton}
        onClose={(): void => setPrimaryButton(undefined)}
        open={Boolean(primaryButton)}
      >
        {timelines.reduce<JSX.Element[]>((menuItems, otherTimeline) => {
          if (otherTimeline.id === timeline.id) return menuItems;

          menuItems.push(
            <MenuItem
              key={otherTimeline.id}
              disabled={props.disabled}
              onClick={(): void => props.onConfirmDelete?.(otherTimeline.id)}
            >
              {otherTimeline.title}
            </MenuItem>,
          );

          return menuItems;
        }, [])}
      </Menu>
    </>
  );
};

export default DeleteTimelinePrompt;
