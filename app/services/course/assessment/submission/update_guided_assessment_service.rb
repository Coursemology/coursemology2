# frozen_string_literal: true
class Course::Assessment::Submission::UpdateGuidedAssessmentService <
  Course::Assessment::Submission::UpdateService

  def load_or_create_answers
    super if @submission.attempting?

    @answers = @submission.answers.where(question: current_question)
  end

  private

  def step_param
    params.permit(:step)[:step]
  end

  def questions_to_attempt
    @assessment.questions.where(id: current_question)
  end

  def current_question
    @current_question ||=
      begin
        step = step_param.to_i - 1
        if @submission.attempting? && cannot?(:manage, @assessment)
          @assessment.questions.step(@submission, step)
        else
          step = [[0, step].max, @assessment.questions.length - 1].min
          @assessment.questions.fetch(step)
        end
      end
  end
end
