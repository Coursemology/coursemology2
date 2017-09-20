# frozen_string_literal: true
class Course::Condition::Assessment < ApplicationRecord
  include ActiveSupport::NumberHelper

  acts_as_condition

  # Trigger for evaluating the satisfiability of conditionals for a course user
  Course::Assessment::Submission.after_save do |submission|
    Course::Condition::Assessment.on_dependent_status_change(submission)
  end

  validate :validate_assessment_condition, if: :assessment_id_changed?
  after_save :clear_duplication_flag

  belongs_to :assessment, class_name: Course::Assessment.name, inverse_of: :assessment_conditions

  default_scope { includes(:assessment) }

  alias_method :dependent_object, :assessment

  def title
    if minimum_grade_percentage
      minimum_grade_percentage_display = number_to_percentage(minimum_grade_percentage,
                                                              precision: 2,
                                                              strip_insignificant_zeros: true)
      self.class.human_attribute_name('title.minimum_score',
                                      assessment_title: assessment.title,
                                      minimum_grade_percentage: minimum_grade_percentage_display)
    else
      self.class.human_attribute_name('title.complete',
                                      assessment_title: assessment.title)
    end
  end

  def satisfied_by?(course_user)
    # Unpublished assessments are considered not satisfied.
    return false unless assessment.published?

    user = course_user.user

    if minimum_grade_percentage
      minimum_grade = assessment.maximum_grade * minimum_grade_percentage / 100.0
      published_submissions_with_minimum_grade(user, minimum_grade).exists?
    else
      submitted_submissions_by_user(user).exists?
    end
  end

  # Class that the condition depends on.
  def self.dependent_class
    Course::Assessment.name
  end

  def self.on_dependent_status_change(submission)
    return unless submission.changes.key?(:workflow_state)

    submission.execute_after_commit do
      evaluate_conditional_for(submission.course_user) if submission.current_state >= :submitted
    end
  end

  def initialize_duplicate(duplicator, other)
    self.assessment = duplicator.duplicate(other.assessment)
    self.conditional_type = other.conditional_type
    self.conditional = duplicator.duplicate(other.conditional)

    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
    end

    @duplicating = true
  end

  private

  def submitted_submissions_by_user(user)
    # TODO: Replace with Rails 5 ActiveRecord::Relation#or with named scope
    assessment.submissions.by_user(user).where(workflow_state: [:submitted, :graded, :published])
  end

  def published_submissions_with_minimum_grade(user, minimum_grade)
    assessment.submissions.by_user(user).with_published_state.
      joins(:answers).
      group('course_assessment_submissions.id').
      when_having { coalesce(sum(answers.grade), 0) >= minimum_grade }
  end

  def validate_assessment_condition
    validate_references_self
    validate_unique_dependency unless @duplicating
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

  def clear_duplication_flag
    @duplicating = nil
  end
end
