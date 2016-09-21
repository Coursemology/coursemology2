# frozen_string_literal: true
module Course::Assessment::Submission::ExperiencePointsDisplayConcern
  extend ActiveSupport::Concern

  # The reason to be displayed for the submission's experience point award.
  #
  # @return [String] The reason which will be displayed
  def experience_points_display_reason
    assessment.title
  end

  # Returns an array which will be used to generate the URL to the edit submission page.
  #
  # @return [Array] Parameters to generate the URL to the edit submission page.
  def experience_points_reason_url_params
    [:edit, assessment.course, assessment, self]
  end
end
