# frozen_string_literal: true
module Course::Assessment::Submission::Koditsu::SubmissionTimesConcern
  extend ActiveSupport::Concern

  def calculate_submission_time(state, questions)
    return nil unless state == 'submitted'

    attempted_questions = questions.reject do |question|
      question['status'] == 'notStarted'
    end

    final_submission_time(attempted_questions)
  end

  private

  def final_submission_time(attempted_questions)
    return @assessment.end_at&.iso8601 || Time.now.utc if attempted_questions.empty?

    attempted_questions.map do |question|
      DateTime.parse(question['filesSavedAt']).in_time_zone
    end.max&.iso8601
  end
end
