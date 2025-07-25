# frozen_string_literal: true
class Course::Condition::ScholaisticAssessment < ApplicationRecord
  acts_as_condition

  validates :assessment, presence: true
  validate :validate_scholaistic_assessment_condition, if: :assessment_id_changed?

  belongs_to :assessment, class_name: Course::Scholaistic::Assessment.name,
                          inverse_of: :scholaistic_assessment_conditions

  default_scope { includes(:assessment) }

  alias_method :dependent_object, :assessment

  def title
    self.class.human_attribute_name('title.complete', assessment_title: assessment.title)
  end

  def satisfied_by?(course_user)
    scholaistic_course_user = course_user.scholaistic_course_user
    return false unless scholaistic_course_user

    ScholaisticApiService.submission_status!(scholaistic_course_user, assessment) == 'graded'
  end

  def self.dependent_class
    Course::Scholaistic::Assessment.name
  end

  private

  def validate_scholaistic_assessment_condition
    validate_references_self
    validate_unique_dependency unless duplicating?
    validate_acyclic_dependency
  end

  def validate_references_self
    return unless assessment == conditional

    errors.add(:assessment, :references_self)
  end

  def validate_unique_dependency
    return unless required_assessments_for(conditional).include?(assessment)

    errors.add(:assessment, :unique_dependency)
  end

  def validate_acyclic_dependency
    return unless cyclic?

    errors.add(:assessment, :cyclic_dependency)
  end

  def required_assessments_for(conditional)
    Course::Scholaistic::Assessment.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.assessment_id
          FROM course_condition_scholaistic_assessments cca INNER JOIN course_conditions cc
          ON cc.actable_type = 'Course::Condition::ScholaisticAssessment' AND cc.actable_id = cca.id
          WHERE cc.conditional_id = #{conditional.id}
            AND cc.conditional_type = #{ActiveRecord::Base.connection.quote(conditional.class.name)}
        ) ids
      ON ids.assessment_id = course_scholaistic_assessments.id
    SQL
  end
end
