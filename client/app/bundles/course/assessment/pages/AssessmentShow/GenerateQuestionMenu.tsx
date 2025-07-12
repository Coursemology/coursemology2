import { useRef, useState } from 'react';
import { AutoFixHigh } from '@mui/icons-material';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';
import { QuestionType } from 'types/course/assessment/question';

import Link from 'lib/components/core/Link';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface GenerateQuestionMenuProps {
  with: NonNullable<AssessmentData['generateQuestionUrls']>;
}

const GenerateQuestionMenu = (
  props: GenerateQuestionMenuProps,
): JSX.Element => {
  const { with: generateQuestionUrls } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const generateButton = useRef<HTMLButtonElement>(null);

  const handleClose = (): void => setOpen(false);

  const GENERATE_QUESTION_LABELS: Record<
    keyof typeof QuestionType,
    Descriptor
  > = {
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

  return (
    <>
      <Button
        ref={generateButton}
        onClick={(): void => setOpen(true)}
        size="small"
        startIcon={<AutoFixHigh />}
        variant="outlined"
      >
        {t(translations.generate)}
      </Button>

      <Menu anchorEl={generateButton.current} onClose={handleClose} open={open}>
        {generateQuestionUrls.map((url) => {
          const label = t(GENERATE_QUESTION_LABELS[url.type]);
          if (url.type === 'Programming') {
            return (
              <Link key={url.type} opensInNewTab to={url.url} underline="none">
                <Tooltip title={t(translations.generateTooltip)}>
                  <MenuItem>{label}</MenuItem>
                </Tooltip>
              </Link>
            );
          }
          return (
            <Link key={url.type} opensInNewTab to={url.url} underline="none">
              <MenuItem>{label}</MenuItem>
            </Link>
          );
        })}
      </Menu>
    </>
  );
};

export default GenerateQuestionMenu;
