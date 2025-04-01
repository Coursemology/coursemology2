import CourseAPI from 'api/course';

export const updateScore = async (
  answerId: number,
  id: number,
  newScore: number,
): Promise<void> => {
  CourseAPI.assessment.answer.rubricBasedResponse.updateScore(
    answerId,
    id,
    newScore,
  );
};

export const updateExplanation = async (
  answerId: number,
  id: number,
  explanation: string,
): Promise<void> => {
  CourseAPI.assessment.answer.rubricBasedResponse.updateExplanation(
    answerId,
    id,
    explanation,
  );
};
