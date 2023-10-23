# frozen_string_literal: true
module Signals::Slices::AssessmentSubmissions
  include Course::UnreadCountsConcern

  def generate_sync_for_assessment_submissions
    { assessments_submissions: pending_assessment_submissions_count }
  end
end
