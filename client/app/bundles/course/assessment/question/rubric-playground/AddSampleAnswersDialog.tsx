import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Checkbox, RadioGroup } from '@mui/material';
import { RubricAnswerData } from 'types/course/rubrics';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Prompt from 'lib/components/core/dialogs/Prompt';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import Table, { ColumnTemplate } from 'lib/components/table';

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
}

const AddSampleAnswersDialog: FC<Props> = (props) => {
  const { answers, onSubmit, onClose, open } = props;

  const { control, handleSubmit, watch, setValue, getValues } = useForm<{
    addMode: AddSampleMode;
    addAnswerIds: number[];
    addRandomAnswerCount: number;
    addMockAnswerTitle: '';
    addMockAnswerText: '';
  }>({
    defaultValues: {
      addMode: AddSampleMode.SPECIFIC_ANSWER,
      addAnswerIds: [],
      addRandomAnswerCount: 0,
      addMockAnswerTitle: '',
      addMockAnswerText: '',
    },
  });

  const columns: ColumnTemplate<RubricAnswerData>[] = [
    {
      id: 'selectAnswer',
      title: '',
      cell: (answer) => (
        <Checkbox
          defaultChecked={false}
          onChange={(e) => {
            const currentAnswerIds = getValues('addAnswerIds');
            if (e.target.value) {
              setValue('addAnswerIds', [...currentAnswerIds, answer.id]);
            } else {
              setValue(
                'addAnswerIds',
                currentAnswerIds.filter((a) => a !== answer.id),
              );
            }
          }}
        />
      ),
    },
    {
      of: 'title',
      title: 'Student',
      searchable: true,
      sortable: true,
      cell: (answer) => answer.title,
    },
    {
      of: 'grade',
      title: 'Grade',
      searchable: true,
      sortable: true,
      sortProps: {
        undefinedPriority: 'last',
      },
      cell: (answer) => `${answer.grade} / `,
    },
    {
      of: 'answerText',
      title: 'Answer',
      cell: (answer) => <div className="line-clamp-4">{answer.answerText}</div>,
    },
  ];

  const selectedAddMode = watch('addMode');

  return (
    <Prompt
      maxWidth={false}
      onClickPrimary={handleSubmit(onSubmit)}
      onClose={onClose}
      open={open}
      primaryLabel="Add"
      title="Add Sample Answers"
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
                label="Add existing answers"
                value={AddSampleMode.SPECIFIC_ANSWER}
              />
              {selectedAddMode === AddSampleMode.SPECIFIC_ANSWER && (
                <Table
                  className="overflow-x-scroll"
                  columns={columns}
                  data={answers}
                  getRowClassName={(answer): string => `answer_${answer.id}`}
                  getRowEqualityData={(answer) => answer}
                  getRowId={(instance): string => instance.id.toString()}
                  pagination={{
                    rowsPerPage: [5],
                  }}
                  search={{
                    searchPlaceholder:
                      'Search answers by student name or grade',
                  }}
                  toolbar={{
                    show: true,
                  }}
                />
              )}
              <RadioButton
                className="my-0"
                disabled={false}
                label={
                  <div className="align-middle items-center">
                    <span> Add </span>
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
                    random student answer(s)
                  </div>
                }
                value={AddSampleMode.RANDOM_STUDENT}
              />
              <RadioButton
                className="my-0"
                disabled={false}
                label="Write a custom answer"
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
                      placeholder="Write the answer here"
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

export default AddSampleAnswersDialog;
