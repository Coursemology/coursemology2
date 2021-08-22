# frozen_string_literal: true
module Course::Condition::ConditionsHelper
  # Checks if component of current condition is enabled. ie. If Achievements is disabled, checking
  #   component_enabled? for achievement conditions returns false.
  #
  # @param [String] class_name Class name of the condition
  # @return [Boolean] Returns whether the component is enabled or disabled
  def component_enabled?(class_name)
    !current_component_host[conditions_component_hash[class_name]].nil?
  end

  private

  # Hash with specific condition model names as keys and symbols as course component keys
  #
  # @return [Hash<String, Symbol>] The required hash.
  def conditions_component_hash
    {}.tap do |hash|
      hash[Course::Condition::Achievement.name] = :course_achievements_component
      hash[Course::Condition::Assessment.name] = :course_assessments_component
      hash[Course::Condition::Level.name] = :course_levels_component
      hash[Course::Condition::Survey.name] = :course_survey_component
    end
  end
end
