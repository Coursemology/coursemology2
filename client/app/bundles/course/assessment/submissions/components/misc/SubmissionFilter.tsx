import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';

import { Autocomplete, Button, Stack, TextField } from '@mui/material';

import {
  SubmissionAssessmentFilterData,
  SubmissionFilterData,
  SubmissionGroupFilterData,
  SubmissionUserFilterData,
} from 'types/course/assessment/submissions';

interface Props extends WrappedComponentProps {
  showDetailFilter: boolean;
  filter: SubmissionFilterData;

  tabCategories: { id: number; title: string }[];
  categoryNum: number;

  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  setTableIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

  setSelectedAssessment: React.Dispatch<
    React.SetStateAction<SubmissionAssessmentFilterData | null>
  >;
  setSelectedGroup: React.Dispatch<
    React.SetStateAction<SubmissionGroupFilterData | null>
  >;
  setSelectedUser: React.Dispatch<
    React.SetStateAction<SubmissionUserFilterData | null>
  >;
  handleFilterOnClick: (newPageNumber: number) => void;
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
});

const SubmissionFilter: FC<Props> = (props) => {
  const {
    intl,
    showDetailFilter,
    filter,
    tabCategories,
    categoryNum,
    setSelectedAssessment,
    setSelectedGroup,
    setSelectedUser,
    handleFilterOnClick,
  } = props;

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
              setSelectedAssessment(value);
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
              setSelectedGroup(value);
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
              setSelectedUser(value);
            }}
          />
          <Button
            variant="contained"
            sx={{ width: 130 }}
            onClick={(): void => handleFilterOnClick(1)}
          >
            {intl.formatMessage(translations.filterButton)}
          </Button>
        </>
      )}
    </Stack>
  );
};
export default injectIntl(SubmissionFilter);
