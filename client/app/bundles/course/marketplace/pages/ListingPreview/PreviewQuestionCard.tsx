import { useState } from 'react';
import {
  EditNote,
  ExpandLess,
  ExpandMore,
  VisibilityOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
  Collapse,
  IconButton,
  Radio,
  Tooltip,
  Typography,
} from '@mui/material';

// Reuse the assessment show/editor descriptors (type chip, showOptions/hideOptions, staff-only
// comments) so the card is visually identical to AssessmentShow/Question.tsx minus its controls.
import translations from 'course/assessment/translations';
import Checkbox from 'lib/components/core/buttons/Checkbox';
import Link from 'lib/components/core/Link';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import { withFromTab } from '../../fromTab';
import previewTranslations from '../../translations';
import { PreviewQuestionSummary } from '../../types';

interface Props {
  of: PreviewQuestionSummary;
  index: number;
  listingId: string;
  fromTab?: string | null;
}

const PreviewQuestionCard = ({
  of: q,
  index,
  listingId,
  fromTab = null,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const detailUrl = withFromTab(
    `/courses/${getCourseId()}/marketplace/listings/${listingId}/questions/${q.id}`,
    fromTab,
  );

  return (
    <section className="flex-col items-start border-0 border-b border-solid border-neutral-200 pb-6 last:border-b-0">
      <section className="relative flex w-full items-start px-6 py-6">
        <div className="absolute -left-5 top-5 flex items-center justify-center rounded-full bg-blue-500 wh-10">
          <Typography color="white" variant="body2">
            {index + 1}
          </Typography>
        </div>

        <div className="flex w-full flex-col items-start space-y-4">
          <Typography>{q.title}</Typography>

          <div className="flex space-x-2">
            <Chip color="info" label={q.type} size="small" variant="outlined" />

            {q.unautogradable && (
              <Chip
                color="warning"
                label={t(translations.notAutogradable)}
                size="small"
                variant="outlined"
              />
            )}
          </div>
        </div>

        <Tooltip disableInteractive title={t(previewTranslations.viewDetails)}>
          <Link to={detailUrl} underline="none">
            <IconButton aria-label={t(previewTranslations.viewDetails)}>
              <VisibilityOutlined />
            </IconButton>
          </Link>
        </Tooltip>
      </section>

      <section className="space-y-4 px-6 pt-4">
        {q.description && <UserHTMLText html={q.description} />}

        {q.options && q.options.length > 0 && (
          <div className="space-y-4">
            <Button
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={(): void => setExpanded((wasExpanded) => !wasExpanded)}
              size="small"
              variant="outlined"
            >
              {expanded
                ? t(translations.hideOptions)
                : t(translations.showOptions)}
            </Button>

            <Collapse in={expanded}>
              {q.options.map((choice) => (
                <Checkbox
                  key={choice.id}
                  checked={choice.correct}
                  className="text-neutral-500"
                  component={q.mcqMrqType === 'mcq' ? Radio : undefined}
                  labelClassName="items-start"
                  readOnly
                  userHTML={choice.option}
                  variant="body2"
                />
              ))}
            </Collapse>
          </div>
        )}

        {q.staffOnlyComments && (
          <Alert
            className="[&_p]:m-0"
            icon={
              <Tooltip title={t(translations.staffOnlyComments)}>
                <EditNote />
              </Tooltip>
            }
            severity="info"
          >
            <UserHTMLText html={q.staffOnlyComments} />
          </Alert>
        )}
      </section>
    </section>
  );
};

export default PreviewQuestionCard;
