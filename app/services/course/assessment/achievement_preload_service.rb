# frozen_string_literal: true

# This service preloads all Achievement conditionals which lists Assessments as conditions.
# Used for Assessments#Index to reduce n+1 queries.
class Course::Assessment::AchievementPreloadService
  # Initialises the service with the listed assessments.
  #
  # @param [Array<Course::Assessment>] assessments
  def initialize(assessments)
    @assessment_ids = assessments.map(&:id)
  end

  # Returns all achievement conditionals listing the given assessment as a condition.
  #
  # @param [Course::Assessment] assessment
  # @return [Array<Course::Achievement>]
  def achievement_conditional_for(assessment)
    achievement_ids = assessment_achievement_hash[assessment.id]
    return [] unless achievement_ids

    achievements.select { |ach| achievement_ids.include?(ach.id) }
  end

  private

  # Loads the relevant assessment_conditions
  def assessment_condition_ids
    @assessment_condition_ids ||=
      Course::Condition::Assessment.where(assessment_id: @assessment_ids)
  end

  # Loads the relevant achievements
  def achievements
    @achievements ||= begin
      achievement_ids = assessment_achievement_hash.values.flatten.uniq
      Course::Achievement.where(id: achievement_ids)
    end
  end

  # Builds the hash linking the specific assessment_id to the achievement_id.
  # eg. { 1: [2, 4], 3: [4] } Indicates assessment 1 is required for achievements 2 and 4,
  #   while assessment 3 is required for achievement 4.
  #
  # @return [Hash]
  def assessment_achievement_hash
    @hash ||= {}.tap do |result|
      assessment_condition_with_achievement_conditional.map do |condition|
        assessment_id = condition.specific.assessment_id
        result[assessment_id] = [] unless result.key?(assessment_id)
        result[assessment_id] << condition.conditional_id
      end
    end
  end

  # Loads the conditions with Assessments as the condition and Achievements as the conditional
  # Query also eager loads the specific condition.
  def assessment_condition_with_achievement_conditional
    Course::Condition.where(actable_type: Course::Condition::Assessment.name,
                            actable_id: assessment_condition_ids,
                            conditional_type: Course::Achievement.name).
      includes(:actable)
  end
end
