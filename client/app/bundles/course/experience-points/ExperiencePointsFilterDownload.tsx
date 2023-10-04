import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages } from 'react-intl';
import { Download } from '@mui/icons-material';
import {
  Autocomplete,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  ExperiencePointsFilterData,
  ExperiencePointsNameFilterData,
} from 'types/course/experiencePointsRecords';

import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  filter: ExperiencePointsFilterData;
  selectedFilter: {
    name: ExperiencePointsNameFilterData | null;
  };
  setSelectedFilter: Dispatch<
    SetStateAction<{
      name: ExperiencePointsNameFilterData | null;
    }>
  >;
  setPageNum: Dispatch<SetStateAction<number>>;
  onClick: () => void;
}

const translations = defineMessages({
  filterByNameButton: {
    id: 'course.experiencePoints.filterByNameButton',
    defaultMessage: 'Filter by Name',
  },
  downloadCsvButton: {
    id: 'course.experiencePoints.downloadCsvButton',
    defaultMessage: 'Download as CSV',
  },
  applyFilterButton: {
    id: 'course.experiencePoints.applyFilterButton',
    defaultMessage: 'Apply Filter',
  },
  clearFilterButton: {
    id: 'course.experiencePoints.clearFilterButton',
    defaultMessage: 'Clear Filter',
  },
});

const ExperiencePointsFilterDownload: FC<Props> = (props) => {
  const { filter, selectedFilter, setSelectedFilter, setPageNum, onClick } =
    props;

  const { t } = useTranslation();

  return (
    <div className="flex w-full justify-between">
      <Grid columns={{ xs: 1, md: 3 }} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            key="experience-points-name-selector"
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(_, value: { id: number; name: string } | null): void => {
              setPageNum(1);
              setSelectedFilter({
                ...selectedFilter,
                name: value,
              });
            }}
            options={filter.names}
            renderInput={(params): JSX.Element => {
              return (
                <TextField
                  {...params}
                  label={t(translations.filterByNameButton)}
                  sx={{ width: 500 }}
                  variant="filled"
                />
              );
            }}
            size="small"
            value={selectedFilter.name}
          />
        </Grid>
      </Grid>

      <Grid className="justify-end items-center" container>
        <Tooltip title={t(translations.downloadCsvButton)}>
          <IconButton onClick={onClick} size="small">
            <Download />
          </IconButton>
        </Tooltip>
      </Grid>
    </div>
  );
};

export default ExperiencePointsFilterDownload;
