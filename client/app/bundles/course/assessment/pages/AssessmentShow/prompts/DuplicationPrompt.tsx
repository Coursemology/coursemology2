import { Fragment, useDeferredValue, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowForwardRounded, SearchOffRounded } from '@mui/icons-material';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import { QuestionData } from 'types/course/assessment/questions';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import { duplicateQuestion } from '../../../operations';
import translations from '../../../translations';

interface DuplicationPromptProps {
  for: QuestionData;
  onClose: () => void;
  open: boolean;
}

const filter = (
  keyword: string,
  question: QuestionData,
): QuestionData['duplicationUrls'] => {
  if (!keyword) return question.duplicationUrls;

  return question.duplicationUrls?.reduce<
    NonNullable<QuestionData['duplicationUrls']>
  >((targets, tab) => {
    const filteredDestinations = tab.destinations.filter((assessment) =>
      assessment.title.toLowerCase().includes(keyword.toLowerCase().trim()),
    );

    if (filteredDestinations.length === 0) return targets;

    targets.push({
      tab: tab.tab,
      destinations: filteredDestinations,
    });

    return targets;
  }, []);
};

interface TargetsListProps {
  disabled: boolean;
  containing: string;
  for: QuestionData;
  onSelectTarget: (duplicationUrl: string) => void;
}

const TargetsList = (props: TargetsListProps): JSX.Element => {
  const { containing: keyword, for: question } = props;
  const { t } = useTranslation();
  const targets = useMemo(() => filter(keyword, question), [keyword, question]);

  if (!targets || targets.length === 0)
    return (
      <div className="flex h-full flex-col items-center justify-center p-10 text-neutral-400">
        <div className="flex items-center justify-center rounded-full p-4 outline">
          <SearchOffRounded className="wh-32" />
        </div>

        <Typography className="mt-8" variant="h6">
          {t(translations.noItemsMatched, { keyword: keyword.trim() })}
        </Typography>

        <Typography>{t(translations.tryAgain)}</Typography>
      </div>
    );

  return (
    <List dense disablePadding>
      {targets?.map((tab) => (
        <Fragment key={tab.tab}>
          <ListSubheader className="bg-neutral-100">{tab.tab}</ListSubheader>

          {tab.destinations.map((assessment) => (
            <ListItem
              key={assessment.duplicationUrl}
              className="group"
              disablePadding
            >
              <ListItemButton
                disabled={props.disabled}
                onClick={(): void =>
                  props.onSelectTarget(assessment.duplicationUrl)
                }
              >
                <ListItemText>{assessment.title}</ListItemText>

                <ListItemIcon
                  className={`min-w-fit ${
                    props.disabled
                      ? 'invisible'
                      : 'hoverable:invisible group-hover?:visible'
                  }`}
                >
                  <ArrowForwardRounded />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </Fragment>
      ))}
    </List>
  );
};

const DuplicationPrompt = (props: DuplicationPromptProps): JSX.Element => {
  const { for: question } = props;

  const { t } = useTranslation();
  const [duplicating, setDuplicating] = useState(false);
  const [keyword, setKeyword] = useState('');
  const deferredKeyword = useDeferredValue(keyword);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const duplicate = (duplicationUrl: string): void => {
    setDuplicating(true);

    toast
      .promise(duplicateQuestion(duplicationUrl), {
        pending: t(translations.duplicatingQuestion),
        success: {
          render: ({ data: result }) => {
            const destinationUrl = result?.destinationUrl;

            if (destinationUrl === pathname) {
              navigate(0);

              return (
                <Typography variant="body2">
                  {t(translations.questionDuplicatedRefreshing)}
                </Typography>
              );
            }

            return (
              <Typography variant="body2">
                {t(translations.questionDuplicated)}
                &nbsp;
                <Link href={result?.destinationUrl} opensInNewTab>
                  {t(translations.goToAssessment)}&nbsp;&rarr;
                </Link>
              </Typography>
            );
          },
        },
        error: {
          render: ({ data }) => {
            const error = (data as Error)?.message;
            return error || t(translations.errorDuplicatingQuestion);
          },
        },
      })
      .then(props.onClose)
      .finally(() => setDuplicating(false));
  };

  const targetsList = useMemo(
    () => (
      <TargetsList
        containing={deferredKeyword}
        disabled={duplicating}
        for={question}
        onSelectTarget={duplicate}
      />
    ),
    [deferredKeyword, duplicating, question],
  );

  return (
    <Prompt
      contentClassName="space-y-4 flex flex-col h-screen"
      onClose={props.onClose}
      open={props.open}
      title={t(translations.chooseAssessmentToDuplicateInto)}
    >
      <PromptText>{t(translations.duplicatingThisQuestion)}</PromptText>

      <PromptText className="line-clamp-2 pb-7 italic">
        {question.title}
      </PromptText>

      <TextField
        autoFocus
        className="!mt-8"
        disabled={duplicating}
        fullWidth
        label={t(translations.searchTargetAssessment)}
        onChange={(e): void => setKeyword(e.target.value)}
        size="small"
        trims
        value={keyword}
        variant="filled"
      />

      <Paper className="h-screen overflow-scroll" variant="outlined">
        {targetsList}
      </Paper>
    </Prompt>
  );
};

export default DuplicationPrompt;
