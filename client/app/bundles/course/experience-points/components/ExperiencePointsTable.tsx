import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableBody, TableCell, TableHead } from '@mui/material';

import { setNotification } from 'lib/actions';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { fetchAllExperiencePointsRecord } from '../operations';
import { getAllExpPointsRecordsEntities } from '../selectors';

import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props extends WrappedComponentProps {
  studentId?: number;
  pageNum: number;
}

const translations = defineMessages({
  fetchRecordsFailure: {
    id: 'course.experiencePoints.fetchRecordsFailure',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsTable: FC<Props> = (props) => {
  const { intl, studentId, pageNum } = props;
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const records = useAppSelector(getAllExpPointsRecordsEntities);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchAllExperiencePointsRecord(studentId, pageNum))
      .catch(() =>
        dispatch(setNotification(t(translations.fetchRecordsFailure))),
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, [pageNum, studentId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <TableContainer dense variant="bare">
      <TableHead>
        <TableCell>{intl.formatMessage(tableTranslations.updatedAt)}</TableCell>
        <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
        <TableCell>{intl.formatMessage(tableTranslations.updater)}</TableCell>
        <TableCell>{intl.formatMessage(tableTranslations.reason)}</TableCell>
        <TableCell className="max-md:!hidden text-right">
          {intl.formatMessage(tableTranslations.experiencePointsAwarded)}
        </TableCell>
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <ExperiencePointsTableRow key={record.id} record={record} />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default injectIntl(ExperiencePointsTable);
