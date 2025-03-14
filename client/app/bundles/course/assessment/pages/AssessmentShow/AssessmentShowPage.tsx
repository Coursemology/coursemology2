import { useEffect, useState } from 'react';
import { AutoFixHigh, InsertDriveFile } from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import KoditsuChipButton from 'course/assessment/components/Koditsu/KoditsuChipButton';
import { syncWithKoditsu } from 'course/assessment/operations/assessments';
import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import { SYNC_STATUS } from 'lib/constants/sharedConstants';
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

  const isKoditsu = assessment.isKoditsuAssessmentEnabled;
  const isKoditsuIndicatorShown = isKoditsu && !assessment.isStudent;

  const [syncStatus, setSyncStatus] = useState<keyof typeof SYNC_STATUS>(
    assessment.isSyncedWithKoditsu ? SYNC_STATUS.Synced : SYNC_STATUS.Syncing,
  );

  useEffect(() => {
    if (isKoditsuIndicatorShown && syncStatus === SYNC_STATUS.Syncing) {
      syncWithKoditsu(assessment.id)
        .then(() => setSyncStatus(SYNC_STATUS.Synced))
        .catch(() => setSyncStatus(SYNC_STATUS.Failed));
    }
  }, [syncStatus]);

  return (
    <Page
      actions={<AssessmentShowHeader with={assessment} />}
      backTo={assessment.indexUrl}
      className="space-y-5"
      title={
        <div className="flex flex-row space-x-5 align-middle">
          <Typography variant="h5">{assessment.title}</Typography>
          {isKoditsuIndicatorShown && (
            <KoditsuChipButton
              assessmentId={assessment.id}
              setSyncStatus={setSyncStatus}
              syncStatus={syncStatus}
            />
          )}
        </div>
      }
    >
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
                <Link opensInNewTab to={assessment.componentsSettingsUrl}>
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
                  opensInNewTab
                  to={condition.url}
                  underline="none"
                >
                  <ListItem className="group hover?:bg-neutral-100">
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
          {assessment.generateQuestionUrl && (
            <Tooltip title={t(translations.generateTooltip)}>
              <Link
                opensInNewTab
                to={assessment.generateQuestionUrl}
                underline="none"
              >
                <Button
                  size="small"
                  startIcon={<AutoFixHigh />}
                  sx={{ marginTop: '0 !important', marginLeft: 1 }}
                  variant="outlined"
                >
                  {t(translations.generate)}
                </Button>
              </Link>
            </Tooltip>
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
            <QuestionsManager
              in={assessment.id}
              of={assessment.questions}
              setSyncStatus={setSyncStatus}
            />
          )}
        </Subsection>
      )}
    </Page>
  );
};

export default AssessmentShowPage;
