import {
  Alert,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { blue, green, grey, yellow } from '@mui/material/colors';

import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import { workflowStates } from '../constants';
import { submissionShape } from '../propTypes';
import translations from '../translations';

const styles = {
  header: {
    attempting: {
      backgroundColor: yellow[100],
    },
    submitted: {
      backgroundColor: grey[100],
    },
    graded: {
      backgroundColor: blue[100],
    },
    published: {
      backgroundColor: green[100],
    },
  },
  warningIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  table: {
    maxWidth: 600,
  },
};

const ProgressPanel = (props): JSX.Element => {
  const { submission } = props;
  const { late, submitter, workflowState } = submission;

  const { t } = useTranslation();

  const displayedTime = {
    [workflowStates.Attempting]: 'attemptedAt',
    [workflowStates.Submitted]: 'submittedAt',
    [workflowStates.Graded]: 'gradedAt',
    [workflowStates.Published]: 'gradedAt',
  }[workflowState];

  return (
    <Card variant="outlined">
      <CardHeader
        id="submission-by"
        style={styles.header[workflowState]}
        subheader={t(translations[workflowState])}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        title={t(translations.submissionBy, { name: submitter.name })}
        titleTypographyProps={{ variant: 'subtitle1' }}
      />

      {late && workflowState === workflowStates.Submitted && (
        <Alert className="m-5" severity="error">
          {t(translations.lateSubmission)}
        </Alert>
      )}

      <Table style={styles.table}>
        <TableBody>
          <TableRow>
            <TableCell>{t(translations[displayedTime])}</TableCell>

            <TableCell>
              {formatLongDateTime(submission[displayedTime])}
            </TableCell>
          </TableRow>

          {(workflowState === workflowStates.Graded ||
            workflowState === workflowStates.Published) && (
            <TableRow>
              <TableCell>{t(translations.totalGrade)}</TableCell>
              <TableCell>{`${submission.grade} / ${submission.maximumGrade}`}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

ProgressPanel.propTypes = {
  submission: submissionShape.isRequired,
};

export default ProgressPanel;
