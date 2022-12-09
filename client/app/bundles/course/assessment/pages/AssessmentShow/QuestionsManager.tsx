import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { Paper } from '@mui/material';
import produce from 'immer';
import {
  AssessmentData,
  QuestionData,
} from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import { reorderQuestions } from '../../actions';
import translations from '../../translations';

import Question from './Question';

interface QuestionsManagerProps {
  in: AssessmentData['id'];
  of: QuestionData[];
}

const QuestionsManager = (props: QuestionsManagerProps): JSX.Element => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState(props.of);
  const [submitting, setSubmitting] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<number>();

  const submitOrdering = (
    ordering: QuestionData['id'][],
    onError: () => void,
  ): void => {
    setSubmitting(true);

    toast
      .promise(reorderQuestions(props.in, ordering), {
        pending: t(translations.movingQuestions),
        success: t(translations.questionMoved),
        error: t(translations.errorMovingQuestion),
      })
      .catch(onError)
      .finally(() => {
        setSubmitting(false);
      });
  };

  const moveItemAndUpdate = (source: number, destination: number): void => {
    const currentQuestions = questions;
    const newOrdering = produce(questions, (draft) => {
      const [moved] = draft.splice(source, 1);
      draft.splice(destination, 0, moved);
    });

    setQuestions(newOrdering);
    submitOrdering(
      newOrdering.map((question) => question.id),
      () => setQuestions(currentQuestions),
    );
  };

  const handleDrop = (result: DropResult): void => {
    setCurrentDestination(undefined);
    if (!result.destination || result.destination.droppableId !== 'questions')
      return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    moveItemAndUpdate(sourceIndex, destinationIndex);
  };

  const removeQuestion = (index: number) => () =>
    setQuestions((currentQuestions) =>
      produce(currentQuestions, (draft) => {
        draft.splice(index, 1);
      }),
    );

  const updateQuestion = (index: number) => (newQuestion: QuestionData) =>
    setQuestions((currentQuestions) =>
      produce(currentQuestions, (draft) => {
        draft[index] = newQuestion;
      }),
    );

  return (
    <DragDropContext
      onDragEnd={handleDrop}
      onDragStart={(r): void => setCurrentDestination(r.source.index)}
      onDragUpdate={(r): void => setCurrentDestination(r.destination?.index)}
    >
      <Droppable droppableId="questions">
        {(droppable, { draggingFromThisWith }): JSX.Element => (
          <Paper
            ref={droppable.innerRef}
            variant="outlined"
            {...droppable.droppableProps}
          >
            {questions.map((question, index) => (
              <Question
                key={question.id}
                disabled={submitting}
                draggedTo={currentDestination}
                dragging={Boolean(draggingFromThisWith)}
                index={index}
                of={question}
                onDelete={removeQuestion(index)}
                onUpdate={updateQuestion(index)}
              />
            ))}

            {droppable.placeholder}
          </Paper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default QuestionsManager;
