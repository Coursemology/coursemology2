import { useMemo } from 'react';
import { Autocomplete, Box, Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { Controller, useForm } from 'react-hook-form';

import CourseAPI from 'api/course';
import { AchievementMiniEntity } from 'types/course/achievements';
import { AchievementConditionData } from 'types/course/conditions';
import TextField from 'lib/components/TextField';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Prompt from 'lib/components/Prompt';
import Preload from 'lib/components/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import { AnyConditionProps } from '../AnyCondition';
import { formatErrorMessage } from '../../form/fields/utils/mapError';
import translations from '../translations';

type AchievementOptions = Record<
  AchievementMiniEntity['id'],
  {
    title: AchievementMiniEntity['title'];
    description: AchievementMiniEntity['description'];
    badge: AchievementMiniEntity['badge']['url'];
  }
>;

const AchievementConditionForm = (
  props: AnyConditionProps<AchievementConditionData> & {
    achievements: AchievementOptions;
  },
): JSX.Element => {
  const { achievements } = props;
  const { t } = useTranslation();

  const autocompleteOptions = useMemo(() => {
    const keys = Object.keys(achievements);

    return keys.sort((a, b) => {
      const achievementA = achievements[parseInt(a, 10)].title;
      const achievementB = achievements[parseInt(b, 10)].title;
      return achievementA.localeCompare(achievementB);
    });
  }, [achievements]);

  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: props.condition ?? {
      achievementId: parseInt(autocompleteOptions[0], 10),
    },
  });

  const updateAchievement = (data: AchievementConditionData): void => {
    props.onUpdate(data, (errors) =>
      setError('achievementId', {
        message: errors.errors.achievement,
      }),
    );
  };

  const isNewCondition = !props.condition;

  return (
    <Prompt
      open={props.open}
      onClose={props.onClose}
      title={t(translations.chooseAnAchievement)}
      onClickPrimary={handleSubmit(updateAchievement)}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      primaryDisabled={!isNewCondition && !formState.isDirty}
    >
      <Controller
        name="achievementId"
        control={control}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <Autocomplete
            {...field}
            value={field.value?.toString()}
            onChange={(_, value): void => field.onChange(parseInt(value, 10))}
            disableClearable
            options={autocompleteOptions}
            fullWidth
            getOptionLabel={(id): string =>
              achievements[parseInt(id, 10)]?.title ?? ''
            }
            filterOptions={createFilterOptions({
              stringify: (option) => {
                const achievement = achievements[parseInt(option, 10)];
                return `${achievement.title} ${achievement.description}`;
              },
            })}
            renderOption={(optionProps, option): JSX.Element => {
              const achievement = achievements[parseInt(option, 10)];

              return (
                <Box
                  component="li"
                  {...optionProps}
                  className={`${optionProps.className} space-x-8`}
                  key={option}
                >
                  <img
                    src={achievement.badge}
                    alt={achievement.title}
                    className="max-h-20 w-20"
                  />

                  <div>
                    <Typography variant="body1">{achievement.title}</Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: achievement.description,
                      }}
                    />
                  </div>
                </Box>
              );
            }}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                variant="filled"
                label={t(translations.achievement)}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
              />
            )}
          />
        )}
      />
    </Prompt>
  );
};

const AchievementCondition = (
  props: AnyConditionProps<AchievementConditionData>,
): JSX.Element => {
  const url = props.condition?.url ?? props.conditionAbility?.url;
  if (!url)
    throw new Error(`AchievementCondition received ${url} condition endpoint`);

  const fetchAchievements = async (): Promise<AchievementOptions> => {
    const response = await CourseAPI.conditions.fetchAchievements(url);
    return response.data;
  };

  return (
    <Preload
      while={fetchAchievements}
      render={<LoadingIndicator bare fit className="p-2" />}
      onErrorDo={props.onClose}
    >
      {(data): JSX.Element => (
        <AchievementConditionForm {...props} achievements={data} />
      )}
    </Preload>
  );
};

export default AchievementCondition;
