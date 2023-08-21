import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Autocomplete, Box, Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { AchievementMiniEntity } from 'types/course/achievements';
import { AchievementConditionData } from 'types/course/conditions';

import CourseAPI from 'api/course';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { formatErrorMessage } from '../../../form/fields/utils/mapError';
import { AnyConditionProps } from '../AnyCondition';
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
      onClickPrimary={handleSubmit(updateAchievement)}
      onClose={props.onClose}
      open={props.open}
      primaryDisabled={!isNewCondition && !formState.isDirty}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      title={t(translations.chooseAnAchievement)}
    >
      <Controller
        control={control}
        name="achievementId"
        render={({ field, fieldState: { error } }): JSX.Element => (
          <Autocomplete
            {...field}
            disableClearable
            filterOptions={createFilterOptions({
              stringify: (option) => {
                const achievement = achievements[parseInt(option, 10)];
                return `${achievement.title} ${achievement.description}`;
              },
            })}
            fullWidth
            getOptionLabel={(id): string =>
              achievements[parseInt(id, 10)]?.title ?? ''
            }
            onChange={(_, value): void => field.onChange(parseInt(value, 10))}
            options={autocompleteOptions}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
                label={t(translations.achievement)}
                variant="filled"
              />
            )}
            renderOption={(optionProps, option): JSX.Element => {
              const achievement = achievements[parseInt(option, 10)];

              return (
                <Box
                  component="li"
                  {...optionProps}
                  key={option}
                  className={`${optionProps.className} space-x-8`}
                >
                  <img
                    alt={achievement.title}
                    className="max-h-20 w-20"
                    src={getAchievementBadgeUrl(achievement.badge, true)}
                  />

                  <div>
                    <Typography>{achievement.title}</Typography>

                    <Typography
                      className="line-clamp-3"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{
                        __html: achievement.description,
                      }}
                      variant="body2"
                    />
                  </div>
                </Box>
              );
            }}
            value={field.value?.toString()}
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
      onErrorDo={props.onClose}
      render={<LoadingIndicator bare className="p-2" fit />}
      while={fetchAchievements}
    >
      {(data): JSX.Element => (
        <AchievementConditionForm {...props} achievements={data} />
      )}
    </Preload>
  );
};

export default AchievementCondition;
