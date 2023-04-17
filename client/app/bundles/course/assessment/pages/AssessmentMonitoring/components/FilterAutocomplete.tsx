import { Autocomplete, TextField } from '@mui/material';
import { WatchGroup } from 'types/channels/liveMonitoring';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import useMonitoring from '../hooks/useMonitoring';

interface FilterAutocompleteProps {
  filters: WatchGroup[];
  className?: string;
}

const FilterAutocomplete = (props: FilterAutocompleteProps): JSX.Element => {
  const { t } = useTranslation();
  const monitoring = useMonitoring();

  return (
    <Autocomplete
      ChipProps={{ size: 'small' }}
      className={props.className}
      fullWidth
      getOptionLabel={(filter): string =>
        `${filter.name} (${filter.userIds.length})`
      }
      groupBy={(filter): string => filter.category}
      multiple
      onChange={(_, filters): void => {
        if (filters.length) {
          monitoring.filter(filters.map(({ userIds }) => userIds).flat());
        } else {
          monitoring.filter(undefined);
        }
      }}
      options={props.filters}
      renderInput={(params): JSX.Element => (
        <TextField
          {...params}
          label={t(translations.filterByGroup)}
          size="small"
          variant="filled"
        />
      )}
    />
  );
};

export default FilterAutocomplete;
