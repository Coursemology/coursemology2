import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Delete, ExpandLess, ExpandMore, PlayArrow } from '@mui/icons-material';
import { Card, Chip, IconButton, Typography } from '@mui/material';
import { RubricData } from 'types/course/rubrics';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import Form from 'lib/components/form/Form';

import CategoryManager from './CategoryManager';
import { RubricHeaderFormData } from './types';

const RubricHeader = (props: { rubrics: RubricData[] }): JSX.Element => {
  const { rubrics } = props;
  const [isCategoriesDirty, setIsCategoriesDirty] = useState(false);
  const [rubricIndex, setRubricIndex] = useState(rubrics.length - 1);
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);

  const savedRubric = rubrics[rubricIndex];

  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      <Form<RubricHeaderFormData>
        contextual
        dirty={isCategoriesDirty}
        disabled={false}
        initialValues={{
          categories: rubrics.at(0)?.categories ?? [],
          gradingPrompt: rubrics.at(0)?.gradingPrompt ?? '',
        }}
        onSubmit={() => {}}
      >
        {(control) => (
          <>
            <div className="flex flex-row space-x-3 items-center">
              <Typography className="flex-1" variant="body1">
                {' '}
                Saved Rubric {rubricIndex + 1}{' '}
              </Typography>

              <IconButton
                disabled={false}
                onClick={() => setIsRubricExpanded(!isRubricExpanded)}
              >
                {isRubricExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>

              <IconButton color="info" disabled={false} onClick={() => {}}>
                <PlayArrow />
              </IconButton>

              <IconButton color="error" disabled={false} onClick={() => {}}>
                <Delete />
              </IconButton>

              <Chip
                className="w-fit whitespace-nowrap"
                color="primary"
                label="Highlight for Comparison"
                onClick={() => {}}
                variant="outlined"
              />

              <Chip
                className="whitespace-nowrap"
                color="primary"
                label="Export to Question"
                onClick={() => {}}
                variant="outlined"
              />
            </div>
            {isRubricExpanded && (
              <div className="flex flex-row space-x-4">
                <div className="w-1/2">
                  <Controller
                    control={control}
                    name="gradingPrompt"
                    render={({ field, fieldState }): JSX.Element => (
                      <FormRichTextField
                        disabled={false}
                        field={field}
                        fieldState={fieldState}
                        fullWidth
                      />
                    )}
                  />
                </div>

                <CategoryManager
                  disabled={false}
                  for={savedRubric.categories ?? []}
                />
              </div>
            )}
          </>
        )}
      </Form>
    </Card>
  );
};

export default RubricHeader;
