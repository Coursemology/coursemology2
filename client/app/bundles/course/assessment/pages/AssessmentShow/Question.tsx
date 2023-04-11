import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ContentCopy, Create, DragIndicator } from '@mui/icons-material';
import { Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { QuestionData } from 'types/course/assessment/questions';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import DeleteQuestionButtonPrompt from './prompts/DeleteQuestionButtonPrompt';
import DuplicationPrompt from './prompts/DuplicationPrompt';
import McqWidget from './McqWidget';

interface QuestionProps {
  of: QuestionData;
  index: number;
  dragging: boolean;
  disabled: boolean;
  onDelete: () => void;
  onUpdate: (question: QuestionData) => void;
  draggedTo?: number;
}

const Question = (props: QuestionProps): JSX.Element => {
  const { of: question, index, dragging, draggedTo, disabled } = props;
  const { t } = useTranslation();
  const [duplicating, setDuplicating] = useState(false);

  return (
    <>
      <Draggable
        draggableId={`question-${question.id}`}
        index={index}
        isDragDisabled={disabled}
      >
        {(provided, { isDragging: dragged }): JSX.Element => (
          <section
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`slot-1-white hover?:bg-slot-1 group flex-col items-start border-0 border-b border-solid border-neutral-200 pb-6 last:border-b-0 ${
              dragged ? 'rounded-lg border-b-0 bg-white drop-shadow-md' : ''
            } ${!dragging ? 'hover?:slot-1-neutral-100' : ''}`}
          >
            <section
              className={`bg-slot-1 top-20 flex w-full items-start px-6 py-6 ${
                !dragging ? 'sticky z-10' : ''
              }`}
              {...provided.dragHandleProps}
            >
              <div
                className={`wh-10 absolute -left-5 top-5 flex items-center justify-center rounded-full transition ${
                  !dragged && dragging ? 'scale-0' : ''
                } ${dragged ? 'scale-200 bg-yellow-500' : 'bg-blue-500'} ${
                  disabled ? 'animate-pulse !bg-neutral-400' : ''
                }`}
              >
                <Typography color="white" variant="body2">
                  {(dragged ? draggedTo ?? index : index) + 1}
                </Typography>
              </div>

              {dragged && (
                <Typography
                  className="pointer-coarse:hidden absolute -top-12 rounded-xl bg-neutral-500 px-3 py-1"
                  color="white"
                  variant="caption"
                >
                  {t(translations.press)}&nbsp;
                  <span className="key">Esc</span>
                  &nbsp;{t(translations.whileHoldingToCancelMoving)}
                </Typography>
              )}

              <div className="flex w-full flex-col items-start space-y-4">
                <div className="flex space-x-4">
                  <DragIndicator
                    className={dragging ? 'invisible' : 'visible'}
                    color="disabled"
                    fontSize="small"
                  />

                  {question.title ? (
                    <Typography>{question.title}</Typography>
                  ) : (
                    <Typography className="italic text-neutral-400">
                      {question.defaultTitle}
                    </Typography>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Chip
                    color="info"
                    label={question.type}
                    size="small"
                    variant="outlined"
                  />

                  {question.unautogradable && (
                    <Chip
                      color="warning"
                      label={t(translations.notAutogradable)}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Tooltip
                  disableInteractive
                  title={t(translations.duplicateToAssessment)}
                >
                  <IconButton
                    aria-label={t(translations.duplicateToAssessment)}
                    disabled={disabled || dragging}
                    onClick={(): void => setDuplicating(true)}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>

                {question.editUrl && (
                  <Tooltip disableInteractive title={t(translations.edit)}>
                    <IconButton
                      aria-label={t(translations.edit)}
                      disabled={disabled || dragging}
                      href={question.editUrl}
                    >
                      <Create />
                    </IconButton>
                  </Tooltip>
                )}

                <DeleteQuestionButtonPrompt
                  disabled={disabled || dragging}
                  for={question}
                  onDelete={props.onDelete}
                />
              </div>
            </section>

            <section className="px-6 pt-4">
              {question.description && (
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: question.description,
                  }}
                  variant="body2"
                />
              )}

              <McqWidget for={question} onChange={props.onUpdate} />
            </section>
          </section>
        )}
      </Draggable>

      <DuplicationPrompt
        for={question}
        onClose={(): void => setDuplicating(false)}
        open={duplicating}
      />
    </>
  );
};

export default Question;
