import { QuestionType } from 'types/course/assessment/question';
import {
  Answer,
  ProcessedAnswer,
  Question,
} from 'types/course/statistics/assessmentStatistics';

import { SliderElement } from 'lib/components/extensions/CustomSlider';
import { formatLongDateTime } from 'lib/moment';

/**
 * Processes attempts and generates a list of processed answers and their corresponding slider points.
 * All these have their corresponding indexes, and the indexes are mapped to the questions.
 */
export const processAttempts = (
  allQuestions: Question<keyof typeof QuestionType>[],
  allAnswers: Answer<keyof typeof QuestionType>[],
): {
  questionMap: Map<number, Question<keyof typeof QuestionType>>;
  allProcessedAnswers: ProcessedAnswer<keyof typeof QuestionType>[];
  sliderPoints: SliderElement[];
  maxIndex: number;
} => {
  const type = allQuestions[0].type;
  const questionMap = new Map<number, Question<keyof typeof QuestionType>>();
  const allProcessedAnswers: ProcessedAnswer<keyof typeof QuestionType>[] = [];
  const sliderPoints: SliderElement[] = [];

  let currIndex = 0;
  let baseIndex = 1;

  if (type === 'Programming') {
    (allAnswers as Answer<'Programming'>[]).forEach((answer) => {
      if (answer.testCases.length === 0) {
        allProcessedAnswers.push({
          ...answer,
          testCases: {},
        });
        questionMap.set(currIndex, allQuestions[0]);
        sliderPoints.push({
          value: currIndex,
          tooltip: `Attempt ${baseIndex} - ${formatLongDateTime(answer.submittedAt)}`,
        });
        currIndex += 1;
        baseIndex += 1;
      } else {
        const tempSliderPoints: SliderElement[] = [];

        answer.testCases.forEach((testCase) => {
          allProcessedAnswers.push({
            ...answer,
            testCases: testCase,
          });
          const question = allQuestions.find(
            (q) => q.id === testCase.questionId,
          );
          if (question) {
            questionMap.set(currIndex, question);
          }

          tempSliderPoints.push({
            value: currIndex,
            tooltip: `Attempt ${baseIndex} - ${formatLongDateTime(answer.submittedAt)}`,
          });

          currIndex += 1;
        });
        baseIndex += 1;
        sliderPoints.push(tempSliderPoints);
      }
    });
  } else {
    (
      allAnswers as Answer<Exclude<keyof typeof QuestionType, 'Programming'>>[]
    ).forEach((answer) => {
      allProcessedAnswers.push(answer);
      questionMap.set(currIndex, allQuestions[0]);
      sliderPoints.push({ value: currIndex, label: '' });
      currIndex += 1;
    });
  }

  return {
    questionMap,
    allProcessedAnswers,
    sliderPoints,
    maxIndex: currIndex - 1,
  };
};

export const processLastAttempt = (
  question: Question<keyof typeof QuestionType>,
  answer: Answer<keyof typeof QuestionType>,
): {
  allProcessedAnswers: ProcessedAnswer<keyof typeof QuestionType>;
} => {
  const type = question.type;

  if (type === 'Programming') {
    const processedAnswer = answer as ProcessedAnswer<'Programming'>;
    if (
      (processedAnswer.testCases.public_test?.length ?? 0) +
        (processedAnswer.testCases.private_test?.length ?? 0) +
        (processedAnswer.testCases.evaluation_test?.length ?? 0) ===
      0
    ) {
      return { allProcessedAnswers: { ...processedAnswer, testCases: {} } };
    }
    return {
      allProcessedAnswers: {
        ...processedAnswer,
        testCases: {
          public_test: processedAnswer.testCases.public_test,
          private_test: processedAnswer.testCases.private_test,
          evaluation_test: processedAnswer.testCases.evaluation_test,
        },
      },
    };
  }
  return {
    allProcessedAnswers: answer as Answer<
      Exclude<keyof typeof QuestionType, 'Programming'>
    >,
  };
};
