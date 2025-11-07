import { ComponentRef, FC, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { RubricAnswerData } from 'types/course/rubrics';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Prompt from 'lib/components/core/dialogs/Prompt';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

export enum AddSampleMode {
  SPECIFIC_ANSWER = 'SPECIFIC_ANSWER',
  RANDOM_STUDENT = 'RANDOM_STUDENT',
  CUSTOM_ANSWER = 'CUSTOM_ANSWER',
}

export interface AddSampleAnswersFormData {
  addMode: AddSampleMode;
  addAnswerIds: number[];
  addRandomAnswerCount: number;
  addMockAnswerTitle: string;
  addMockAnswerText: string;
}

interface Props {
  onSubmit: (data: AddSampleAnswersFormData) => Promise<void>;
  onClose: () => void;
  open: boolean;
  answers: RubricAnswerData[];
  maximumGrade: number;
}

const AddAnswersPrompt: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { answers, onSubmit, onClose, open, maximumGrade } = props;

  const tableRef = useRef<ComponentRef<typeof Table>>(null);

  const { control, handleSubmit, watch, setValue } = useForm<{
    addMode: AddSampleMode;
    addAnswerIds: number[];
    addRandomAnswerCount: number;
    addMockAnswerTitle: '';
    addMockAnswerText: '';
  }>({
    defaultValues: {
      addMode: AddSampleMode.SPECIFIC_ANSWER,
      addAnswerIds: [],
      addRandomAnswerCount: 1,
      addMockAnswerTitle: '',
      addMockAnswerText: '',
    },
  });

  const columns: ColumnTemplate<RubricAnswerData>[] = [
    {
      of: 'title',
      title: t(translations.student),
      searchable: true,
      sortable: true,
      cell: (answer) => answer.title,
    },
    {
      of: 'grade',
      title: t(translations.questionGrade),
      searchable: true,
      sortable: true,
      sortProps: {
        undefinedPriority: 'last',
      },
      cell: (answer) =>
        typeof answer.grade === 'number'
          ? `${answer.grade} / ${maximumGrade}`
          : '',
    },
    {
      of: 'answerText',
      title: t(translations.answer),
      cell: (answer) => (
        <Typography
          className="whitespace-normal line-clamp-4"
          dangerouslySetInnerHTML={{
            __html: answer.answerText,
          }}
        />
      ),
    },
  ];

  const selectedAddMode = watch('addMode');

  return (
    <Prompt
      maxWidth={false}
      onClickPrimary={handleSubmit((data: AddSampleAnswersFormData) => {
        data.addAnswerIds = Object.keys(
          tableRef.current?.getRowSelectionState() ?? {},
        ).map((id) => parseInt(id, 10));
        onSubmit(data);
      })}
      onClose={onClose}
      open={open}
      primaryLabel={t(translations.addAnswersPromptAction)}
      title={t(translations.addAnswersTitle)}
    >
      <form>
        <Controller
          control={control}
          name="addMode"
          render={(outerField) => (
            <RadioGroup
              defaultValue={selectedAddMode}
              {...outerField}
              className="space-y-5"
              onChange={(e): void => {
                setValue('addMode', e.target.value as AddSampleMode);
              }}
            >
              <RadioButton
                className="my-0"
                disabled={false}
                label={t(translations.addExistingAnswers)}
                value={AddSampleMode.SPECIFIC_ANSWER}
              />
              {selectedAddMode === AddSampleMode.SPECIFIC_ANSWER && (
                <Table
                  ref={tableRef}
                  className="overflow-x-scroll"
                  columns={columns}
                  data={answers}
                  getRowClassName={(answer): string => `answer_${answer.id}`}
                  getRowEqualityData={(answer) => answer}
                  getRowId={(instance): string => instance.id.toString()}
                  indexing={{ rowSelectable: true }}
                  pagination={{
                    rowsPerPage: [5],
                  }}
                  search={{
                    searchPlaceholder: t(translations.searchAnswersPlaceholder),
                  }}
                  toolbar={{
                    show: true,
                    keepNative: true,
                  }}
                />
              )}
              <RadioButton
                className="my-0"
                disabled={false}
                label={
                  <div className="flex items-center">
                    {t(translations.addRandomStudentAnswers, {
                      inputComponent: (
                        <Controller
                          control={control}
                          name="addRandomAnswerCount"
                          render={({ field, fieldState }) => (
                            <FormTextField
                              className="w-16 mx-3"
                              disabled={
                                selectedAddMode !== AddSampleMode.RANDOM_STUDENT
                              }
                              disableMargins
                              field={field}
                              fieldState={fieldState}
                              inputProps={{ className: 'text-right' }}
                              type="number"
                              variant="standard"
                            />
                          )}
                        />
                      ),
                    })}
                  </div>
                }
                value={AddSampleMode.RANDOM_STUDENT}
              />
              <RadioButton
                className="my-0"
                disabled={false}
                label={t(translations.writeCustomAnswer)}
                value={AddSampleMode.CUSTOM_ANSWER}
              />

              {selectedAddMode === AddSampleMode.CUSTOM_ANSWER && (
                <Controller
                  control={control}
                  name="addMockAnswerText"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormRichTextField
                      disabled={false}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      placeholder={t(translations.writeAnswerPlaceholder)}
                      variant="outlined"
                    />
                  )}
                />
              )}
            </RadioGroup>
          )}
        />
      </form>
    </Prompt>
  );
};

export default AddAnswersPrompt;
