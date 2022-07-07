import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';

import {
  Autocomplete,
  Button,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';

import { SubmissionFilterData } from 'types/course/assessment/submissions';
import { filterSubmissions } from '../../operations';

interface Props extends WrappedComponentProps {
  showDetailFilter: boolean;
  tabCategories: { id: number; title: string }[];
  categoryNum: number;
  filter: SubmissionFilterData;
  submissionCount: number;
  rowsPerPage: number;
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
}

const translations = defineMessages({
  filterAssessmentLabel: {
    id: 'course.assessments.submissions.filterAssessmentLabel',
    defaultMessage: 'Filter by ',
  },
  filterHeader: {
    id: 'course.assessments.submissions.filterHeader',
    defaultMessage: 'Filter Submissions',
  },
  filterButton: {
    id: 'course.assessments.submissions.filterButton',
    defaultMessage: 'Apply Filter',
  },
  filterGetFailure: {
    id: 'course.assessments.submissions.filterGetFailure',
    defaultMessage: 'Failed to filter',
  },
});

const SubmissionFilter: FC<Props> = (props) => {
  const {
    intl,
    showDetailFilter,
    tabCategories,
    categoryNum,
    filter,
    submissionCount,
    rowsPerPage,
    pageNum,
    setPageNum,
  } = props;

  const [selectedAssessment, setselectedAssessment] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [selectedGroup, setselectedGroup] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [selectedUser, setselectedUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const handleFilterOnClick = (): void => {
    const assessmentId = selectedAssessment ? selectedAssessment.id : null;
    const groupId = selectedGroup ? selectedGroup.id : null;
    const userId = selectedUser ? selectedUser.id : null;

    dispatch(
      filterSubmissions(
        tabCategories[categoryNum].id,
        assessmentId,
        groupId,
        userId,
        pageNum,
      ),
    ).catch((error) => {
      toast.error(intl.formatMessage(translations.filterGetFailure));
      throw error;
    });
  };

  // For pagination
  const count = Math.ceil(submissionCount / rowsPerPage);
  const handlePageChange: (
    _e: React.ChangeEvent<unknown>,
    pageNum: number,
  ) => void = (_e, pageNumber) => {
    // Prevent multiple calls when spam clicking
    if (pageNumber !== pageNum) {
      setPageNum(pageNumber);
      const assessmentId = selectedAssessment ? selectedAssessment.id : null;
      const groupId = selectedGroup ? selectedGroup.id : null;
      const userId = selectedUser ? selectedUser.id : null;

      dispatch(
        filterSubmissions(
          tabCategories[categoryNum].id,
          assessmentId,
          groupId,
          userId,
          pageNumber,
        ),
      ).catch((error) => {
        toast.error(intl.formatMessage(translations.filterGetFailure));
        throw error;
      });
    }
  };

  return (
    <Stack spacing={1.5} className="submissions-filter">
      {showDetailFilter && (
        <>
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>
            {intl.formatMessage(translations.filterHeader)}
          </h3>
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-assesment-selector`}
            disablePortal
            clearOnEscape
            options={filter.assessments}
            getOptionLabel={(option): string => option.title}
            renderInput={(params): React.ReactNode => {
              return (
                <TextField
                  {...params}
                  label={`${intl.formatMessage(
                    translations.filterAssessmentLabel,
                  )} ${tabCategories[categoryNum].title}`}
                />
              );
            }}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; title: string } | null,
            ): void => {
              setselectedAssessment(value);
            }}
          />
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-group-selector`}
            disablePortal
            clearOnEscape
            options={filter.groups}
            getOptionLabel={(option): string => option.name}
            renderInput={(params): React.ReactNode => {
              return (
                <TextField
                  {...params}
                  label={`${intl.formatMessage(
                    translations.filterAssessmentLabel,
                  )} Group`}
                />
              );
            }}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; name: string } | null,
            ): void => {
              setselectedGroup(value);
            }}
          />
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-user-selector`}
            disablePortal
            clearOnEscape
            options={filter.users}
            getOptionLabel={(option): string => option.name}
            renderInput={(params): React.ReactNode => {
              return (
                <TextField
                  {...params}
                  label={`${intl.formatMessage(
                    translations.filterAssessmentLabel,
                  )} User`}
                />
              );
            }}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; name: string } | null,
            ): void => {
              setselectedUser(value);
            }}
          />
          <Button
            variant="contained"
            sx={{ width: 130 }}
            onClick={handleFilterOnClick}
          >
            {intl.formatMessage(translations.filterButton)}
          </Button>
        </>
      )}
      {count > 1 && (
        <Pagination
          style={{ padding: 10, display: 'flex', justifyContent: 'center' }}
          count={count}
          onChange={handlePageChange}
        />
      )}
    </Stack>
  );
};

export default memo(injectIntl(SubmissionFilter), (prevProps, nextProps) => {
  return (
    equal(prevProps.tabCategories, nextProps.tabCategories) &&
    equal(prevProps.categoryNum, nextProps.categoryNum) &&
    equal(prevProps.filter, nextProps.filter) &&
    equal(prevProps.pageNum, nextProps.pageNum)
  );
});
