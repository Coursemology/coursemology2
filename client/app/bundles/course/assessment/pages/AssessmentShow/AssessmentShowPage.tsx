import { InsertDriveFile } from '@mui/icons-material';
import {
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import DescriptionCard from 'lib/components/core/DescriptionCard';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import AssessmentDetails from './AssessmentDetails';
import AssessmentShowHeader from './AssessmentShowHeader';
import NewQuestionMenu from './NewQuestionMenu';
import QuestionsManager from './QuestionsManager';
import UnavailableAlert from './UnavailableAlert';

interface AssessmentShowPageProps {
  for: AssessmentData;
}

const AssessmentShowPage = (props: AssessmentShowPageProps): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  return (
    <main className="space-y-5">
      <AssessmentShowHeader with={assessment} />

      {assessment.status === 'unavailable' && (
        <UnavailableAlert for={assessment} />
      )}

      {assessment.description && (
        <DescriptionCard description={assessment.description} />
      )}

      <AssessmentDetails for={assessment} />

      {assessment.files &&
        (!assessment.materialsDisabled || assessment.permissions.canManage) && (
          <Subsection spaced title={t(translations.files)}>
            {assessment.materialsDisabled && (
              <Alert severity="warning">
                {t(translations.materialsDisabledHint)}&nbsp;
                <Link href={assessment.componentsSettingsUrl} opensInNewTab>
                  {t(translations.manageComponents)}
                </Link>
              </Alert>
            )}

            {!assessment.materialsDisabled && !assessment.hasAttempts && (
              <Alert severity="info">
                {t(translations.downloadingFilesAttempts)}
              </Alert>
            )}

            <Paper variant="outlined">
              <List dense>
                {assessment.files.map((file) => (
                  <Link
                    key={file.id}
                    href={file.url}
                    opensInNewTab
                    underline="hover"
                  >
                    <ListItem className="hover?:bg-neutral-100">
                      <ListItemIcon>
                        <InsertDriveFile />
                      </ListItemIcon>

                      <ListItemText>{file.name}</ListItemText>
                    </ListItem>
                  </Link>
                ))}
              </List>
            </Paper>
          </Subsection>
        )}

      {assessment.permissions.canObserve &&
        assessment.requirements.length > 0 && (
          <Subsection
            subtitle={t(translations.requirementsHint)}
            title={t(translations.requirements)}
          >
            <Paper variant="outlined">
              <List dense>
                {assessment.requirements.map((condition) => (
                  <ListItem key={condition.title}>
                    <ListItemText primary={condition.title} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Subsection>
        )}

      {assessment.unlocks && assessment.unlocks.length > 0 && (
        <Subsection
          subtitle={t(translations.finishToUnlockHint)}
          title={t(translations.finishToUnlock)}
        >
          <Paper variant="outlined">
            <List dense>
              {assessment.unlocks.map((condition) => (
                <Link
                  key={condition.url}
                  // TODO: Remove once we get rid of Bootstrap for the love of God
                  className="no-underline"
                  href={condition.url}
                  opensInNewTab
                  underline="none"
                >
                  <ListItem className="hover?:bg-neutral-100 group">
                    <ListItemText
                      classes={{ primary: 'group-hover?:underline' }}
                      primary={condition.title}
                      secondary={condition.description}
                    />
                  </ListItem>
                </Link>
              ))}
            </List>
          </Paper>
        </Subsection>
      )}

      {assessment.questions && (
        <Subsection
          spaced
          subtitle={
            assessment.questions.length > 0
              ? t(translations.questionsReorderHint)
              : t(translations.questionsEmptyHint)
          }
          title={t(translations.questions)}
        >
          {assessment.newQuestionUrls && (
            <NewQuestionMenu with={assessment.newQuestionUrls} />
          )}

          {assessment.hasUnautogradableQuestions && (
            <Alert severity="warning">
              {t(translations.hasUnautogradableQuestionsWarning1)}&nbsp;
              <Chip
                color="warning"
                label={t(translations.notAutogradable)}
                size="small"
                variant="outlined"
              />
              &nbsp;{t(translations.hasUnautogradableQuestionsWarning2)}
            </Alert>
          )}

          {assessment.questions.length > 0 && (
            <QuestionsManager in={assessment.id} of={assessment.questions} />
          )}
        </Subsection>
      )}
    </main>
  );
};

export default AssessmentShowPage;
