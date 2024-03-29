import { FC, memo } from 'react';
import { Divider, ListItem, ListItemText, Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { produce } from 'immer';

import { updateProgrammingQuestion } from 'course/admin/reducers/codaveriSettings';
import Link from 'lib/components/core/Link';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateProgrammingQuestionCodaveri } from '../operations';
import { getProgrammingQuestion, getViewSettings } from '../selectors';
import translations from '../translations';

interface ProgrammingQnListProps {
  questionId: number;
}

const ProgrammingQnList: FC<ProgrammingQnListProps> = (props) => {
  const { questionId } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const programmingQn = useAppSelector((state) =>
    getProgrammingQuestion(state, questionId),
  );
  const { showCodaveriEnabled } = useAppSelector(getViewSettings);

  if (!programmingQn || (showCodaveriEnabled && !programmingQn.isCodaveri))
    return null;

  const handleChange = (isChecked: boolean): void => {
    const updatedQn = produce(programmingQn, (draft) => {
      draft.isCodaveri = isChecked;
    });
    updateProgrammingQuestionCodaveri(
      programmingQn.assessmentId,
      programmingQn.id,
      updatedQn,
    )
      .then(() => {
        dispatch(updateProgrammingQuestion(updatedQn));
        toast.success(
          t(translations.evaluatorUpdateSuccess, {
            question: programmingQn.title,
            evaluator: isChecked ? 'codaveri' : 'default',
          }),
        );
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenUpdating));
      });
  };

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
        <Switch
          checked={programmingQn.isCodaveri}
          color="primary"
          onChange={(_, isChecked): void => handleChange(isChecked)}
        />
      </ListItem>
      <Divider className="border-neutral-200 last:border-none" />
    </>
  );
};

export default memo(ProgrammingQnList, equal);
