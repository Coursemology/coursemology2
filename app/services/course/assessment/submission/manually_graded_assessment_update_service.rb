# frozen_string_literal: true
class Course::Assessment::Submission::ManuallyGradedAssessmentUpdateService <
  Course::Assessment::Submission::UpdateService

  private

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions
  end
end
