# frozen_string_literal: true
module Signals::Slices::AssessmentSubmissions
  include Course::UnreadCountsConcern

  def generate_sync
    { assessments_submissions: pending_assessment_submissions_count }
  end
end
