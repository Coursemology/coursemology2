import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, TableBody, TableCell, TableRow } from '@mui/material';
import palette from 'theme/palette';
import { LogsMainInfo } from 'types/course/assessment/submission/logs';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import Link from 'lib/components/core/Link';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import submissionTranslations from '../../translations';

import translations from './translations';

interface Props {
  with: LogsMainInfo;
}

const translateStatus: (var1: string) => Descriptor = (oldStatus) => {
  switch (oldStatus) {
    case 'attempting':
      return submissionTranslations.attempting;
    case 'submitted':
      return submissionTranslations.submitted;
    case 'graded':
      return submissionTranslations.graded;
    case 'published':
      return submissionTranslations.published;
    default:
      return submissionTranslations.unknown;
  }
};

const LogsHead: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { with: info } = props;

  return (
    <TableContainer dense variant="outlined">
      <TableBody>
        <TableRow>
          <TableCell variant="head">
            {t(translations.assessmentTitle)}
          </TableCell>
          <TableCell>
            <Link to={info.assessmentUrl}>{info.assessmentTitle}</Link>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell variant="head">{t(translations.studentName)}</TableCell>
          <TableCell>
            <Link to={info.studentUrl}>{info.studentName}</Link>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell variant="head">
            {t(translations.submissionWorkflowState)}
          </TableCell>
          <TableCell>
            <Link to={info.editUrl}>
              <Chip
                label={t(translateStatus(info.submissionWorkflowState))}
                style={{
                  width: 100,
                  backgroundColor:
                    palette.submissionStatus[info.submissionWorkflowState],
                }}
              />
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

export default LogsHead;
