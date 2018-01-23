# frozen_string_literal: true
class Course::Settings::LessonPlanComponent < Course::Settings::Component
  include ActiveModel::Conversion

  MILESTONES_EXPANDED_VALUES = %w(all none current).freeze

  # Returns the setting which controls which milestones groups are expanded when
  # the lesson plan page is first loaded.
  #
  # @return [String] A value in MILESTONES_EXPANDED_VALUES
  delegate :milestones_expanded, to: :settings

  # Sets which milestones groups are expanded when the lesson plan page is first loaded.
  #
  # @return [String] The new setting
  def milestones_expanded=(setting)
    raise ArgumentError, 'Invalid lesson plan milestone groups expanded setting.' \
      unless MILESTONES_EXPANDED_VALUES.include?(setting)

    settings.milestones_expanded = setting
  end
end
