# frozen_string_literal: true
module Course::Survey::Response::ExperiencePointsDisplayConcern
  extend ActiveSupport::Concern

  # The reason to be displayed for the response's experience point award.
  #
  # @return [String] The reason which will be displayed
  def experience_points_display_reason
    survey.title
  end
end
