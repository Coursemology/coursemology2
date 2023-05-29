import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';
import {
  SubmissionAssessmentFilterData,
  SubmissionFilterData,
  SubmissionGroupFilterData,
  SubmissionUserFilterData,
} from 'types/course/assessment/submissions';

interface Props extends WrappedComponentProps {
  filter: SubmissionFilterData;

  tabCategories: { id: number; title: string }[];
  categoryNum: number;

  setPageNum: Dispatch<SetStateAction<number>>;
  setTableIsLoading: Dispatch<SetStateAction<boolean>>;
  selectedFilter: {
    assessment: SubmissionAssessmentFilterData | null;
    group: SubmissionGroupFilterData | null;
    user: SubmissionUserFilterData | null;
  };
  setSelectedFilter: Dispatch<
    SetStateAction<{
      assessment: SubmissionAssessmentFilterData | null;
      group: SubmissionGroupFilterData | null;
      user: SubmissionUserFilterData | null;
    }>
  >;
  handleFilterOnClick: (newPageNumber: number) => void;
}

const translations = defineMessages({
  filterAssessmentLabel: {
    id: 'course.assessment.submissions.SubmissionFilter.filterAssessmentLabel',
    defaultMessage: 'Filter by ',
  },
  applyFilterButton: {
    id: 'course.assessment.submissions.SubmissionFilter.applyFilterButton',
    defaultMessage: 'Apply Filter',
  },
  clearFilterButton: {
    id: 'course.assessment.submissions.SubmissionFilter.clearFilterButton',
    defaultMessage: 'Clear Filter',
  },
});

const SubmissionFilter: FC<Props> = (props) => {
  const {
    intl,
    filter,
    tabCategories,
    categoryNum,
    selectedFilter,
    setSelectedFilter,
    handleFilterOnClick,
  } = props;
  const disableButton = Object.values(selectedFilter).every((x) => x === null);

  return (
    <Stack className="submissions-filter" spacing={1}>
      <Grid columns={{ xs: 1, md: 3 }} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            key={`${tabCategories[categoryNum].id}-${tabCategories[categoryNum].title}-assesment-selector`}
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.title}
            onChange={(
              _,
              value: { id: number; title: string } | null,
            ): void => {
              setSelectedFilter({
                ...selectedFilter,
                assessment: value,
              });
            }}
            options={filter.assessments}
            renderInput={(params): JSX.Element => {
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
            onChange={(_, value: { id: number; name: string } | null): void => {
              setSelectedFilter({
                ...selectedFilter,
                group: value,
              });
            }}
            options={filter.groups}
            renderInput={(params): JSX.Element => {
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
            onChange={(_, value: { id: number; name: string } | null): void => {
              setSelectedFilter({
                ...selectedFilter,
                user: value,
              });
            }}
            options={filter.users}
            renderInput={(params): JSX.Element => {
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
