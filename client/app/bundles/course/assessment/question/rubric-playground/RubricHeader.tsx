import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Delete, ExpandLess, ExpandMore, PlayArrow } from '@mui/icons-material';
import { Card, Chip, IconButton, Typography } from '@mui/material';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import Form from 'lib/components/form/Form';
import { useAppSelector } from 'lib/hooks/store';
import { formatLongDateTime } from 'lib/moment';

import CategoryManager from './CategoryManager';
import { RubricHeaderFormData } from './types';

const RubricHeader = (props: {
  selectedRubricId: number;
}): JSX.Element | null => {
  const { selectedRubricId } = props;
  const [isCategoriesDirty, setIsCategoriesDirty] = useState(false);
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);

  const savedRubric = useAppSelector(
    (state) => state.assessments.question.rubrics,
  ).rubrics[selectedRubricId];

  if (!savedRubric) return null;
  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      <Form<RubricHeaderFormData>
        contextual
        dirty={isCategoriesDirty}
        disabled={false}
        initialValues={{
          categories: savedRubric.categories ?? [],
          gradingPrompt: savedRubric.gradingPrompt ?? '',
        }}
        onSubmit={() => {}}
      >
        {(control) => (
          <>
            <div className="flex flex-row space-x-3 items-center">
              <Typography className="flex-1" variant="body1">
                Saved Rubric, {formatLongDateTime(savedRubric.createdAt)}
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

                <CategoryManager disabled={false} />
              </div>
            )}
          </>
        )}
      </Form>
    </Card>
  );
};

export default RubricHeader;
