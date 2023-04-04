import { FC } from 'react';
import { Link as ReactLink } from 'react-router-dom';
import { TableBody, TableCell, TableRow } from '@mui/material';
import { LogsMainInfo } from 'types/course/assessment/submission/logs';

import Link from 'lib/components/core/Link';
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
            <ReactLink to={info.assessmentUrl}>
              {info.assessmentTitle}
            </ReactLink>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{t(translations.studentName)}</TableCell>
          <TableCell>
            <Link href={info.studentUrl}>{info.studentName}</Link>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{t(translations.submissionStatus)}</TableCell>
          <TableCell>
            <ReactLink to={info.editUrl}>{info.submissionStatus}</ReactLink>
          </TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

export default LogsHead;
