# frozen_string_literal: true
module Course::Assessment::Submission::ExperiencePointsDisplayConcern
  extend ActiveSupport::Concern

  # The reason to be displayed for the submission's experience point award.
  #
  # @return [String] The reason which will be displayed
  def experience_points_display_reason
    assessment.title
  end
end
