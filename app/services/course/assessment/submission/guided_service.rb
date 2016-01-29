# frozen_string_literal: true
class Course::Assessment::Submission::GuidedService < Course::Assessment::SubmissionService
  private

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions.step(@submission, step_param)
  end

  def step_param
    params.permit(:step)[:step]
  end
end
