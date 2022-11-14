import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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

  if (!showDetailFilter) return null;

  return (
    <Stack className="submissions-filter" spacing={1}>
      <h3 style={{ marginTop: 0, marginBottom: 0 }}>
        {intl.formatMessage(translations.filterHeader)}
      </h3>
      <Grid columns={{ xs: 1, md: 3 }} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-assesment-selector`}
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.title}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; title: string } | null,
            ): void => {
              setSelectedFilter({
                ...selectedFilter,
                assessment: value,
              });
            }}
            options={filter.assessments}
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
            value={selectedFilter.assessment}
          />
        </Grid>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-group-selector`}
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; name: string } | null,
            ): void => {
              setSelectedFilter({
                ...selectedFilter,
                group: value,
              });
            }}
            options={filter.groups}
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
            value={selectedFilter.group}
          />
        </Grid>
        <Grid item paddingRight={1} xs={1}>
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-user-selector`}
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(
              _event: React.SyntheticEvent,
              value: { id: number; name: string } | null,
            ): void => {
              setSelectedFilter({
                ...selectedFilter,
                user: value,
              });
            }}
            options={filter.users}
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
            value={selectedFilter.user}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Button
          disabled={disableButton}
          onClick={(): void => handleFilterOnClick(1)}
          variant="contained"
        >
          {intl.formatMessage(translations.applyFilterButton)}
        </Button>
        <Button
          color="secondary"
          disabled={disableButton}
          onClick={(): void => {
            setSelectedFilter({
              assessment: null,
              group: null,
              user: null,
            });
          }}
          style={{ marginLeft: 10 }}
          variant="contained"
        >
          {intl.formatMessage(translations.clearFilterButton)}
        </Button>
      </Grid>
    </Stack>
  );
};
export default injectIntl(SubmissionFilter);
