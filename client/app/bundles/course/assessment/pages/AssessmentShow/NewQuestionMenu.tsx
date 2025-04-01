import { useRef, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';
import { QuestionType } from 'types/course/assessment/question';

import Link from 'lib/components/core/Link';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface NewQuestionMenuProps {
  with: NonNullable<AssessmentData['newQuestionUrls']>;
}

const NEW_QUESTION_LABELS: Record<keyof typeof QuestionType, Descriptor> = {
  MultipleChoice: translations.multipleChoice,
  MultipleResponse: translations.multipleResponse,
  TextResponse: translations.textResponse,
  VoiceResponse: translations.voiceResponse,
  FileUpload: translations.fileUpload,
  Programming: translations.programming,
  Scribing: translations.scribing,
  ForumPostResponse: translations.forumPostResponse,
  Comprehension: translations.comprehension,
  RubricBasedResponse: translations.rubricBasedResponse,
};

const NewQuestionMenu = (props: NewQuestionMenuProps): JSX.Element => {
  const { with: newQuestionUrls } = props;
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const newQuestionButton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={newQuestionButton}
        onClick={(): void => setCreating(true)}
        size="small"
        startIcon={<Add />}
        variant="outlined"
      >
        {t(translations.newQuestion)}
      </Button>

      <Menu
        anchorEl={newQuestionButton.current}
        onClose={(): void => setCreating(false)}
        open={creating}
      >
        {newQuestionUrls.map((url) => (
          <Link key={url.type} opensInNewTab to={url.url} underline="none">
            <MenuItem>{t(NEW_QUESTION_LABELS[url.type])}</MenuItem>
          </Link>
        ))}
      </Menu>
    </>
  );
};

export default NewQuestionMenu;
