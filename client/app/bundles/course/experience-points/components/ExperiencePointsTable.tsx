import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { TableBody, TableCell, TableHead } from '@mui/material';

import { setNotification } from 'lib/actions';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import {
  fetchAllExperiencePointsRecord,
  fetchUserExperiencePointsRecord,
} from '../operations';
import { getAllExpPointsRecordsEntities } from '../selectors';

import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props {
  studentId?: number;
  pageNum: number;
  isStudentPage?: boolean;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const translations = defineMessages({
  fetchRecordsFailure: {
    id: 'course.experiencePoints.fetchRecordsFailure',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsTable: FC<Props> = (props) => {
  const { studentId, pageNum, isStudentPage, isLoading, setIsLoading } = props;
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const records = useAppSelector(getAllExpPointsRecordsEntities);

  const fetchExperiencePoints = isStudentPage
    ? fetchUserExperiencePointsRecord(studentId!, pageNum)
    : fetchAllExperiencePointsRecord(studentId, pageNum);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchExperiencePoints)
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
        <TableCell>{t(tableTranslations.updatedAt)}</TableCell>
        {!isStudentPage && <TableCell>{t(tableTranslations.name)}</TableCell>}
        <TableCell>{t(tableTranslations.updater)}</TableCell>
        <TableCell>{t(tableTranslations.reason)}</TableCell>
        <TableCell>{t(tableTranslations.experiencePointsAwarded)}</TableCell>
        <TableCell />
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <ExperiencePointsTableRow
            key={record.id}
            id={record.id}
            isStudentPage={isStudentPage}
            maxExp={record.reason.maxExp}
            record={record}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default ExperiencePointsTable;
