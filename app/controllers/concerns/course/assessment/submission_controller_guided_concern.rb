module Course::Assessment::SubmissionControllerGuidedConcern
  extend ActiveSupport::Concern

  private

  def question_to_attempt_guided
    @submission.assessment.questions.step(@submission, step_param)
  end

  def step_param
    params.permit(:step)[:step]
  end
end
