import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';

import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';

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
  selectedFilter: {
    assessment: SubmissionAssessmentFilterData | null;
    group: SubmissionGroupFilterData | null;
    user: SubmissionUserFilterData | null;
  };
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<{
      assessment: SubmissionAssessmentFilterData | null;
      group: SubmissionGroupFilterData | null;
      user: SubmissionUserFilterData | null;
    }>
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
  applyFilterButton: {
    id: 'course.assessments.submissions.applyFilterButton',
    defaultMessage: 'Apply Filter',
  },
  clearFilterButton: {
    id: 'course.assessments.submissions.clearFilterButton',
    defaultMessage: 'Clear Filter',
  },
});

const SubmissionFilter: FC<Props> = (props) => {
  const {
    intl,
    showDetailFilter,
    filter,
    tabCategories,
    categoryNum,
    selectedFilter,
    setSelectedFilter,
    handleFilterOnClick,
  } = props;
  const disableButton = Object.values(selectedFilter).every((x) => x === null);

  return (
    <>
      {showDetailFilter && (
        <Stack spacing={1} className="submissions-filter">
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>
            {intl.formatMessage(translations.filterHeader)}
          </h3>
          <Grid container columns={{ xs: 1, md: 3 }}>
            <Grid item xs={1} paddingRight={1} paddingBottom={1}>
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
                  setSelectedFilter({
                    ...selectedFilter,
                    assessment: value,
                  });
                }}
                value={selectedFilter.assessment}
              />
            </Grid>
            <Grid item xs={1} paddingRight={1} paddingBottom={1}>
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
                  setSelectedFilter({
                    ...selectedFilter,
                    group: value,
                  });
                }}
                value={selectedFilter.group}
              />
            </Grid>
            <Grid item xs={1} paddingRight={1}>
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
                  setSelectedFilter({
                    ...selectedFilter,
                    user: value,
                  });
                }}
                value={selectedFilter.user}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Button
              disabled={disableButton}
              variant="contained"
              onClick={(): void => handleFilterOnClick(1)}
            >
              {intl.formatMessage(translations.applyFilterButton)}
            </Button>
            <Button
              disabled={disableButton}
              color="secondary"
              variant="contained"
              onClick={(): void => {
                setSelectedFilter({
                  assessment: null,
                  group: null,
                  user: null,
                });
              }}
              style={{ marginLeft: 10 }}
            >
              {intl.formatMessage(translations.clearFilterButton)}
            </Button>
          </Grid>
        </Stack>
      )}
    </>
  );
};
export default injectIntl(SubmissionFilter);
