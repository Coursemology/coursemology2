# frozen_string_literal: true
class Course::Condition::Survey < ApplicationRecord
  acts_as_condition
  include DuplicationStateTrackingConcern

  # Trigger for evaluating the satisfiability of conditionals for a course user
  Course::Survey::Response.after_save do |response|
    Course::Condition::Survey.on_dependent_status_change(response)
  end

  validate :validate_survey_condition, if: :survey_id_changed?
  validates :survey, presence: true
  belongs_to :survey, class_name: 'Course::Survey', inverse_of: :survey_conditions

  default_scope { includes(:survey) }

  alias_method :dependent_object, :survey

  def title
    self.class.human_attribute_name('title.complete', survey_title: survey.title)
  end

  # Checks if the user has completed the required survey.
  #
  # @param [CourseUser] course_user The user that the survey condition is being checked on. The
  #   user must respond to `surveys` and returns an ActiveRecord::Association that
  #   contains all surveys the subject has obtained.
  # @return [Boolean] true if the user has the required survey and false otherwise.
  def satisfied_by?(course_user)
    # Unpublished surveys are considered not satisfied.
    return false unless survey.published?

    submitted_response_by_user(course_user)
  end

  # Returns a boolean array denoting whether each of the specified
  # course users has satisfied the survey condition.
  #
  # @param [Array<CourseUser>] course_users The specified course users.
  # @return [Array<Boolean>] At each index, true if the corresponding course
  #   user has submitted the required survey and false otherwise.
  def compute_satisfaction_information(course_users)
    satisfaction_information = Array.new(course_users.length, false)
    course_user_ids = course_users.map(&:id)
    course_user_submissions = survey.responses.submitted.where(course_user_id: course_user_ids)
    course_user_ids_to_indices = course_user_ids.map.with_index { |course_user_id, index| [course_user_id, index] }.to_h

    course_user_submissions.each do |course_user_submission|
      satisfaction_information[course_user_ids_to_indices[course_user_submission.course_user_id]] = true
    end

    satisfaction_information
  end

  # Class that the condition depends on.
  def self.dependent_class
    Course::Survey.name
  end

  def self.on_dependent_status_change(response)
    return unless response.saved_changes.key?(:submitted_at)

    response.execute_after_commit { evaluate_conditional_for(response.course_user) }
  end

  def initialize_duplicate(duplicator, other)
    self.survey = duplicator.duplicate(other.survey)
    self.conditional_type = other.conditional_type
    self.conditional = duplicator.duplicate(other.conditional)

    case duplicator.mode
    when :course
      self.course = duplicator.duplicate(other.course)
    when :object
      self.course = duplicator.options[:destination_course]
    end

    set_duplication_flag
  end

  private

  def submitted_response_by_user(user)
    survey.responses.submitted.find_by(course_user_id: user.id)
  end

  def validate_survey_condition
    validate_references_self
    validate_unique_dependency unless duplicating?
    validate_acyclic_dependency
  end

  def validate_references_self
    return unless survey == conditional

    errors.add(:survey, :references_self)
  end

  def validate_unique_dependency
    return unless required_surveys_for(conditional).include?(survey)

    errors.add(:survey, :unique_dependency)
  end

  def validate_acyclic_dependency
    return unless cyclic?

    errors.add(:survey, :cyclic_dependency)
  end

  # Given a conditional object, returns all surveys that it requires.
  #
  # @param [#conditions] conditional The object that is declared as acts_as_conditional and for
  #   which returned surveys are required.
  # @return [Array<Course::Survey>]
  def required_surveys_for(conditional)
    # Course::Condition::Survey.
    #   joins { condition.conditional(Course::Survey) }.
    #   where.has { condition.conditional.id == survey.id }.
    #   map(&:survey)

    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390) that will allow
    # allow the above query to work without #reload
    Course::Survey.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.survey_id
          FROM course_condition_surveys cca INNER JOIN course_conditions cc
            ON cc.actable_type = 'Course::Condition::Survey' AND cc.actable_id = cca.id
            WHERE cc.conditional_id = #{conditional.id}
              AND cc.conditional_type = #{ActiveRecord::Base.connection.quote(conditional.class.name)}
        ) ids
      ON ids.survey_id = course_surveys.id
    SQL
  end
end
