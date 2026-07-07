import { Controller, useFormContext } from 'react-hook-form';
import { Delete } from '@mui/icons-material';
import {
  Alert,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { GradingContextSourceOption } from 'types/course/assessment/question/grading-contexts';

import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

const TYPE_LABELS = {
  sibling_question_answer: translations.gradingContextTypeSiblingQuestionAnswer,
  forum_thread: translations.gradingContextTypeForumThread,
};

const TYPE_HINTS = {
  sibling_question_answer:
    translations.gradingContextTypeSiblingQuestionAnswerHint,
  forum_thread: translations.gradingContextTypeForumThreadHint,
};

interface GradingContextItemProps {
  index: number;
  availableGradingContextTypes: string[];
  contextSourceOptions: GradingContextSourceOption[];
  disabled?: boolean;
  onDelete: () => void;
}

const GradingContextItem = (props: GradingContextItemProps): JSX.Element => {
  const {
    index,
    availableGradingContextTypes,
    contextSourceOptions,
    disabled,
  } = props;
  const { t } = useTranslation();
  const { control, watch, setValue } = useFormContext();

  const contextType = watch(`gradingContexts.${index}.contextType`) as string;

  return (
    <Paper className="flex items-start space-x-4 p-4" variant="outlined">
      <div className="flex grow flex-col space-y-4">
        <div className="flex space-x-4">
          <Controller
            control={control}
            name={`gradingContexts.${index}.contextType`}
            render={({ field, fieldState }): JSX.Element => (
              <TextField
                {...field}
                className="w-1/2"
                disabled={disabled}
                error={!!fieldState.error}
                label={t(translations.gradingContextType)}
                onChange={(event): void => {
                  // Reset the source when the type changes -- a sibling id is meaningless for other types.
                  field.onChange(event);
                  setValue(`gradingContexts.${index}.sourceId`, null);
                }}
                select
                size="small"
                variant="filled"
              >
                <MenuItem disabled value="">
                  {t(translations.gradingContextTypePlaceholder)}
                </MenuItem>
                {availableGradingContextTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {TYPE_LABELS[type] ? t(TYPE_LABELS[type]) : type}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            control={control}
            name={`gradingContexts.${index}.identifier`}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                className="w-1/2"
                disabled={disabled}
                disableMargins
                field={field}
                fieldState={fieldState}
                label={t(translations.gradingContextIdentifier)}
                size="small"
                variant="filled"
              />
            )}
          />
        </div>

        {contextType && (
          <>
            {TYPE_HINTS[contextType] && (
              <Alert severity="info">{t(TYPE_HINTS[contextType])}</Alert>
            )}

            {contextType === 'sibling_question_answer' ? (
              <Controller
                control={control}
                name={`gradingContexts.${index}.sourceId`}
                render={({ field, fieldState }): JSX.Element => (
                  <div className="flex flex-col space-y-1">
                    <Autocomplete
                      disabled={disabled}
                      getOptionLabel={(option): string => option.title}
                      onChange={(_, option): void =>
                        field.onChange(option?.id ?? null)
                      }
                      options={contextSourceOptions}
                      renderInput={(params): JSX.Element => (
                        <TextField
                          {...params}
                          error={!!fieldState.error}
                          label={t(translations.gradingContextSource)}
                          size="small"
                          variant="filled"
                        />
                      )}
                      value={
                        contextSourceOptions.find(
                          (option) => option.id === field.value,
                        ) ?? null
                      }
                    />
                    {fieldState.error && (
                      <FormHelperText error>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </div>
                )}
              />
            ) : (
              <TextField
                disabled
                label={t(translations.gradingContextSource)}
                size="small"
                value={t(translations.gradingContextThisQuestion)}
                variant="filled"
              />
            )}
          </>
        )}
      </div>

      <Tooltip title={t(translations.removeGradingContext)}>
        <IconButton
          aria-label={t(translations.removeGradingContext)}
          color="error"
          disabled={disabled}
          onClick={props.onDelete}
        >
          <Delete />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default GradingContextItem;
