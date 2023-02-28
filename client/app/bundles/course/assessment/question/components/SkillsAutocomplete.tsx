import { useMemo } from 'react';
import { FieldError, FieldValues } from 'react-hook-form';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { AvailableSkills } from 'types/course/assessment/questions';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface SkillsAutocompleteProps {
  field: FieldValues;
  availableSkills: NonNullable<AvailableSkills['availableSkills']>;
  error?: FieldError;
  disabled?: boolean;
}

const SkillsAutocomplete = (props: SkillsAutocompleteProps): JSX.Element => {
  const { t } = useTranslation();

  const availableSkillIds = useMemo(
    () => Object.keys(props.availableSkills),
    [],
  );

  return (
    <Autocomplete
      {...props.field}
      ChipProps={{ size: 'small' }}
      disabled={props.disabled}
      filterOptions={createFilterOptions({
        stringify: (option) => {
          const skill = props.availableSkills[parseInt(option, 10)];
          return skill ? `${skill.title} ${skill.description}` : '';
        },
      })}
      fullWidth
      getOptionLabel={(skill): string =>
        props.availableSkills[skill].title ?? ''
      }
      isOptionEqualToValue={(option, value): boolean =>
        option === value.toString()
      }
      multiple
      onChange={(_, values): void =>
        props.field.onChange(values.map((value) => parseInt(value, 10)))
      }
      options={availableSkillIds}
      renderInput={(inputProps): JSX.Element => (
        <TextField
          {...inputProps}
          error={Boolean(props.error)}
          helperText={props.error && formatErrorMessage(props.error.message)}
          label={t(translations.skills)}
          variant="filled"
        />
      )}
      renderOption={(optionProps, option): JSX.Element => {
        const skill = props.availableSkills[option];

        return (
          <Box
            component="li"
            {...optionProps}
            key={option}
            className={`${optionProps.className} flex-col items-start`}
          >
            <Typography>{skill.title}</Typography>

            {skill.description && (
              <Typography
                className="line-clamp-3"
                color="text.secondary"
                dangerouslySetInnerHTML={{
                  __html: skill.description,
                }}
                variant="body2"
              />
            )}
          </Box>
        );
      }}
      value={props.field.value}
    />
  );
};

export default SkillsAutocomplete;
