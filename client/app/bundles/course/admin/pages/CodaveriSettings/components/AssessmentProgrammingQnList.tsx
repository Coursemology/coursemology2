import { FC, memo } from 'react';
import { Divider, ListItem, ListItemText, Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { produce } from 'immer';

import { updateProgrammingQuestion } from 'course/admin/reducers/codaveriSettings';
import Link from 'lib/components/core/Link';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateProgrammingQuestionLiveFeedback } from '../operations';
import { getProgrammingQuestion, getViewSettings } from '../selectors';
import translations from '../translations';

import CodaveriToggleButtons from './buttons/CodaveriToggleButtons';

interface ProgrammingQnListProps {
  questionId: number;
  isOnlyForLiveFeedbackSetting?: boolean;
}

const ProgrammingQnList: FC<ProgrammingQnListProps> = (props) => {
  const { questionId, isOnlyForLiveFeedbackSetting } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const programmingQn = useAppSelector((state) =>
    getProgrammingQuestion(state, questionId),
  );
  const { showCodaveriEnabled } = useAppSelector(getViewSettings);

  if (!programmingQn || (showCodaveriEnabled && !programmingQn.isCodaveri))
    return null;

  const handleLiveFeedbackEnabledChange = (isChecked: boolean): void => {
    const updatedQn = produce(programmingQn, (draft) => {
      draft.liveFeedbackEnabled = isChecked;
    });
    updateProgrammingQuestionLiveFeedback(
      programmingQn.assessmentId,
      programmingQn.id,
      updatedQn,
    )
      .then(() => {
        dispatch(updateProgrammingQuestion(updatedQn));
        toast.success(
          t(translations.liveFeedbackEnabledUpdateSuccess, {
            question: programmingQn.title,
            liveFeedbackEnabled: isChecked,
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.errorOccurredWhenUpdatingCodaveriEvaluatorSettings),
        );
      });
  };

  const LiveFeedbackToggle = (): JSX.Element => (
    <Switch
      checked={programmingQn.liveFeedbackEnabled}
      color="primary"
      onChange={(_, isChecked): void =>
        handleLiveFeedbackEnabledChange(isChecked)
      }
    />
  );

  return (
    <>
      <ListItem className="pl-20 flex justify-between">
        <Link
          className="line-clamp-2 xl:line-clamp-1"
          opensInNewTab
          to={programmingQn.editUrl}
          underline="hover"
        >
          <ListItemText primary={programmingQn.title} />
        </Link>
        {isOnlyForLiveFeedbackSetting ? (
          <div className="mr-1">
            <LiveFeedbackToggle />
          </div>
        ) : (
          <CodaveriToggleButtons
            programmingQuestions={[programmingQn]}
            type="question"
          />
        )}
      </ListItem>
      <Divider className="border-neutral-200 last:border-none" />
    </>
  );
};

export default memo(ProgrammingQnList, equal);
