# frozen_string_literal: true
class Course::Condition::ScholaisticAssessment < ApplicationRecord
  acts_as_condition

  validates :scholaistic_assessment, presence: true
  validate :validate_scholaistic_assessment_condition, if: :scholaistic_assessment_id_changed?

  belongs_to :scholaistic_assessment, class_name: Course::ScholaisticAssessment.name,
                                      inverse_of: :scholaistic_assessment_conditions

  default_scope { includes(:scholaistic_assessment) }

  alias_method :dependent_object, :scholaistic_assessment

  def title
    self.class.human_attribute_name('title.complete', title: scholaistic_assessment.title)
  end

  def satisfied_by?(course_user)
    upstream_id = scholaistic_assessment.upstream_id
    submissions = ScholaisticApiService.submissions!([upstream_id], course_user)

    [:submitted, :graded].include?(submissions&.[](upstream_id)&.[](:status))
  rescue StandardError => e
    Rails.logger.error("Failed to load Scholaistic submission: #{e.message}")
    raise e unless Rails.env.production?

    false
  end

  def self.dependent_class
    Course::ScholaisticAssessment.name
  end

  def self.display_name(course)
    course.settings(:course_scholaistic_component)&.assessments_title&.singularize
  end

  private

  def validate_scholaistic_assessment_condition
    validate_references_self
    validate_unique_dependency
  end

  def validate_references_self
    return unless scholaistic_assessment == conditional

    errors.add(:scholaistic_assessment, :references_self)
  end

  def validate_unique_dependency
    return unless required_assessments_for(conditional).include?(scholaistic_assessment)

    errors.add(:scholaistic_assessment, :unique_dependency)
  end

  def required_assessments_for(conditional)
    Course::ScholaisticAssessment.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.scholaistic_assessment_id
          FROM course_condition_scholaistic_assessments cca INNER JOIN course_conditions cc
          ON cc.actable_type = 'Course::Condition::ScholaisticAssessment' AND cc.actable_id = cca.id
          WHERE cc.conditional_id = #{conditional.id}
            AND cc.conditional_type = #{ActiveRecord::Base.connection.quote(conditional.class.name)}
        ) ids
      ON ids.scholaistic_assessment_id = course_scholaistic_assessments.id
    SQL
  end
end
