import { FC } from 'react';
import { FormHelperText } from '@mui/material';
import { RubricGradingContextData } from 'types/course/rubrics';

import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

// The label shown above a grading context's field, describing what the context is (a sibling question's
// answer, the answer's forum thread, etc.). Shared by the mock-answer editor and the view-answer prompt.
const ContextHeading: FC<RubricGradingContextData> = (props) => {
  const { contextType, identifier, sourceTitle } = props;
  const { t } = useTranslation();

  if (contextType === 'forum_thread') {
    return (
      <FormHelperText>
        {t(translations.mockContextHeadingForumThread, { identifier })}
      </FormHelperText>
    );
  }
  if (contextType === 'sibling_question_answer') {
    return (
      <FormHelperText>
        {t(translations.mockContextHeadingSibling, {
          identifier,
          title: sourceTitle ?? '',
        })}
      </FormHelperText>
    );
  }
  return (
    <FormHelperText>
      {t(translations.mockContextHeading, {
        identifier,
      })}
    </FormHelperText>
  );
};

export default ContextHeading;
