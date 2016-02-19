# frozen_string_literal: true
class Course::Assessment::Submission::WorksheetService < Course::Assessment::SubmissionService
  private

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions
  end
end
