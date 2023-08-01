import { useRef, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import {
  AssessmentData,
  QuestionType,
} from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface NewQuestionMenuProps {
  with: NonNullable<AssessmentData['newQuestionUrls']>;
}

const NEW_QUESTION_LABELS: Record<QuestionType, Descriptor> = {
  multipleChoice: translations.multipleChoice,
  multipleResponse: translations.multipleResponse,
  textResponse: translations.textResponse,
  audioResponse: translations.audioResponse,
  fileUpload: translations.fileUpload,
  programming: translations.programming,
  scribing: translations.scribing,
  forumPostResponse: translations.forumPostResponse,
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
