# frozen_string_literal: true
class Course::Condition::Assessment < ActiveRecord::Base
  include ActiveSupport::NumberHelper

  acts_as_condition
  belongs_to :assessment, class_name: Course::Assessment.name, inverse_of: false

  default_scope { includes(:assessment) }

  validate :validate_assessment_condition, if: :assessment_id_changed?

  def title
    if minimum_grade_percentage
      minimum_grade_percentage_display = number_to_percentage(minimum_grade_percentage,
                                                              precision: 2,
                                                              strip_insignificant_zeros: true)
      self.class.human_attribute_name('title.title',
                                      assessment_title: assessment.title,
                                      minimum_grade_percentage: minimum_grade_percentage_display)
    else
      assessment.title
    end
  end

  def satisfied_by?(course_user)
    user = course_user.user

    if minimum_grade_percentage
      minimum_grade = assessment.maximum_grade * minimum_grade_percentage / 100.0
      graded_submissions_with_minimum_grade(user, minimum_grade).exists?
    else
      graded_submissions_by_user(user).exists?
    end
  end

  # Class that the condition depends on.
  def self.dependent_class
    Course::Assessment.name
  end

  private

  def graded_submissions_by_user(user)
    assessment.submissions.by_user(user).with_graded_state
  end

  def graded_submissions_with_minimum_grade(user, minimum_grade)
    graded_submissions_by_user(user).joins { answers }.
      group { course_assessment_submissions.id }.
      having { sum(answers.grade) >= minimum_grade }
  end

  def validate_assessment_condition
    validate_references_self
    validate_unique_dependency
  end

  def validate_references_self
    return unless assessment == conditional
    errors.add(:assessment, :references_self)
  end

  def validate_unique_dependency
    return unless required_assessments_for(conditional).include?(assessment)
    errors.add(:assessment, :unique_dependency)
  end

  # Given a conditional object, returns all assessments that it requires.
  #
  # @param [Object] conditional The object that is declared as acts_as_conditional and for which
  #   returned assessments are required.
  # @return [Array<Course::Assessment]
  def required_assessments_for(conditional)
    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390), similar issue as in
    # Course::Condition::Achievement.
    # TODO: use squeel.
    Course::Assessment.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.assessment_id
          FROM course_condition_assessments cca INNER JOIN course_conditions cc
          ON cc.actable_type = 'Course::Condition::Assessment' AND cc.actable_id = cca.id
          WHERE cc.conditional_id = #{conditional.id}
            AND cc.conditional_type = #{ActiveRecord::Base.sanitize(conditional.class.name)}
        ) ids
      ON ids.assessment_id = course_assessments.id
    SQL
  end
end
