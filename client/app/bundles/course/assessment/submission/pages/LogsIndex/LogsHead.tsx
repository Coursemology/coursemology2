import { FC } from 'react';
import { TableBody, TableCell, TableRow } from '@mui/material';
import { LogsMainInfo } from 'types/course/assessment/submission/logs';

import { TableContainer } from 'lib/components/core/table';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface Props {
  with: LogsMainInfo;
}

const LogsHead: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { with: info } = props;

  return (
    <TableContainer dense variant="outlined">
      <TableBody>
        <TableRow>
          <TableCell>{t(translations.assessmentTitle)}</TableCell>
          <TableCell>
            <a href={info.assessmentUrl}>{info.assessmentTitle}</a>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{t(translations.studentName)}</TableCell>
          <TableCell>
            <a href={info.studentUrl}>{info.studentName}</a>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{t(translations.submissionStatus)}</TableCell>
          <TableCell>
            <a href={info.editUrl}>{info.submissionStatus}</a>
          </TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

export default LogsHead;
