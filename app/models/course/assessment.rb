# frozen_string_literal: true
# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ApplicationRecord
  acts_as_lesson_plan_item has_todo: true
  acts_as_conditional
  has_one_folder

  # Concern must be included below acts_as_lesson_plan_item to override #can_user_start?
  include Course::Assessment::TodoConcern
  include Course::ClosingReminderConcern
  include DuplicationStateTrackingConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :propagate_course, if: :new_record?
  before_validation :assign_folder_attributes
  after_commit :grade_with_new_test_cases, on: :update
  before_save :save_tab, on: :create

  enum randomization: { prepared: 0 }

  validates :autograded, inclusion: { in: [true, false] }
  validates :session_password, length: { maximum: 255 }, allow_nil: true
  validates :tabbed_view, inclusion: { in: [true, false] }
  validates :view_password, length: { maximum: 255 }, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :tab, presence: true

  belongs_to :tab, inverse_of: :assessments

  # `submissions` association must be put before `questions`, so that all answers will be deleted
  # first when deleting the course. Otherwise due to the foreign key `question_id` in answers table,
  # questions cannot be deleted.
  has_many :submissions, inverse_of: :assessment, dependent: :destroy

  has_many :question_assessments, class_name: Course::QuestionAssessment.name,
                                  inverse_of: :assessment, dependent: :destroy
  has_many :questions, through: :question_assessments do
    include Course::Assessment::QuestionsConcern
  end
  has_many :multiple_response_questions,
           through: :questions, inverse_through: :question, source: :actable,
           source_type: Course::Assessment::Question::MultipleResponse.name
  has_many :text_response_questions,
           through: :questions, inverse_through: :question, source: :actable,
           source_type: Course::Assessment::Question::TextResponse.name
  has_many :programming_questions,
           through: :questions, inverse_through: :question, source: :actable,
           source_type: Course::Assessment::Question::Programming.name
  has_many :scribing_questions,
           through: :questions, inverse_through: :question, source: :actable,
           source_type: Course::Assessment::Question::Scribing.name
  has_many :voice_response_questions,
           through: :questions, inverse_through: :question, source: :actable,
           source_type: Course::Assessment::Question::VoiceResponse.name
  has_many :assessment_conditions, class_name: Course::Condition::Assessment.name,
                                   inverse_of: :assessment, dependent: :destroy
  has_many :question_groups, class_name: Course::Assessment::QuestionGroup.name,
                             inverse_of: :assessment, dependent: :destroy
  has_many :question_bundles, class_name: Course::Assessment::QuestionBundle.name, through: :question_groups
  has_many :question_bundle_questions, class_name: Course::Assessment::QuestionBundleQuestion.name,
                                       through: :question_bundles
  has_many :question_bundle_assignments, class_name: Course::Assessment::QuestionBundleAssignment.name,
                                         inverse_of: :assessment, dependent: :destroy

  validate :tab_in_same_course
  validate :selected_test_type_for_grading

  scope :published, -> { where(published: true) }

  # @!attribute [r] maximum_grade
  #   Gets the maximum grade allowed by this assessment. This is the sum of all questions'
  #   maximum grade.
  #   @return [Integer]
  calculated :maximum_grade, (lambda do
    Course::Assessment::Question.
      select('coalesce(sum(caq.maximum_grade), 0)').
      from(
        "course_assessment_questions caq INNER JOIN course_question_assessments cqa ON \
        cqa.assessment_id = course_assessments.id AND cqa.question_id = caq.id"
      )
  end)

  # @!method self.ordered_by_date_and_title
  #   Orders the assessments by the starting date and title.
  scope :ordered_by_date_and_title, (lambda do
    select(<<~SQL).
      course_assessments.*, course_reference_times.start_at, course_lesson_plan_items.title
    SQL
    joins(:lesson_plan_item).
    merge(Course::LessonPlan::Item.ordered_by_date_and_title)
  end)

  # @!method with_submissions_by(creator)
  #   Includes the submissions by the provided user.
  #   @param [User] user The user to preload submissions for.
  scope :with_submissions_by, (lambda do |user|
    submissions = Course::Assessment::Submission.by_user(user).
                  where(assessment: distinct(false).pluck(:id)).ordered_by_date

    all.to_a.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :submissions, submissions)
    end
  end)

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for showing in the lesson plan.
  #
  # Here, actable_data contains the list of tab IDs to be removed.
  scope :ids_showable_in_lesson_plan, (lambda do |actable_data|
    joining { lesson_plan_item }.
      where.not(tab_id: actable_data).
      selecting { lesson_plan_item.id }
  end)

  def self.use_relative_model_naming?
    true
  end

  def to_partial_path
    'course/assessment/assessments/assessment'
  end

  # Update assessment mode from params.
  #
  # @param [Hash] params Params with autograded mode from user.
  def update_mode(params)
    target_mode = params[:autograded]
    return if target_mode == autograded || !allow_mode_switching?

    if target_mode == true
      self.autograded = true
      self.session_password = nil
      self.view_password = nil
      self.delayed_grade_publication = false
    elsif target_mode == false # Ignore the case when the params is empty.
      self.autograded = false
      self.skippable = false
    end
  end

  # Whether the assessment allows mode switching.
  # Allow mode switching if:
  # - The assessment don't have any submissions.
  # - Switching from autograded mode to manually graded mode.
  def allow_mode_switching?
    submissions.count == 0 || autograded?
  end

  # @override ConditionalInstanceMethods#permitted_for!
  def permitted_for!(_course_user)
  end

  # @override ConditionalInstanceMethods#precluded_for!
  def precluded_for!(_course_user)
  end

  # @override ConditionalInstanceMethods#satisfiable?
  def satisfiable?
    published?
  end

  # The password to prevent from viewing the assessment.
  def view_password_protected?
    view_password.present?
  end

  # The password to prevent attempting submission from multiple sessions.
  def session_password_protected?
    session_password.present?
  end

  def downloadable?
    questions.any?(&:downloadable?)
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator)
    target_tab = initialize_duplicate_tab(duplicator, other)
    self.folder = duplicator.duplicate(other.folder)
    folder.parent = target_tab.category.folder
    self.question_assessments = duplicator.duplicate(other.question_assessments)
    initialize_duplicate_conditions(duplicator, other)
    set_duplication_flag
  end

  def include_in_consolidated_email?(event)
    Course::Settings::AssessmentsComponent.email_enabled?(tab.category,
                                                          "assessment_#{event}".to_sym)
  end

  def graded_test_case_types
    [].tap do |result|
      result.push('public_test') if use_public
      result.push('private_test') if use_private
      result.push('evaluation_test') if use_evaluation
    end
  end

  private

  # Parents the assessment under its duplicated parent tab, if it exists.
  #
  # @return [Course::Assessment::Tab] The duplicated assessment's tab
  def initialize_duplicate_tab(duplicator, other)
    if duplicator.duplicated?(other.tab)
      target_tab = duplicator.duplicate(other.tab)
    else
      target_category = duplicator.options[:destination_course].assessment_categories.first
      target_tab = target_category.tabs.first
    end
    self.tab = target_tab
  end

  # Set up conditions that depend on this assessment and conditions that this assessment depends on.
  def initialize_duplicate_conditions(duplicator, other)
    duplicate_conditions(duplicator, other)
    assessment_conditions << other.assessment_conditions.
                             select { |condition| duplicator.duplicated?(condition.conditional) }.
                             map { |condition| duplicator.duplicate(condition) }
  end

  # Sets the course of the lesson plan item to be the same as the one for the assessment.
  def propagate_course
    lesson_plan_item.course = tab.category.course
  end

  def assign_folder_attributes
    # Folder attributes are handled during duplication by folder duplication code
    return if duplicating?
    folder.assign_attributes(name: title, course: course, parent: tab.category.folder,
                             start_at: start_at)
  end

  def set_defaults
    self.published = false
    self.autograded ||= false
  end

  def tab_in_same_course
    return unless tab_id_changed?
    errors.add(:tab, :not_in_same_course) unless tab.category.course == course
  end

  def selected_test_type_for_grading
    errors.add(:no_test_type_chosen) unless use_public || use_private || use_evaluation
  end

  # Check for changes to graded test case booleans for autograded assessments.
  def regrade_programming_answers?
    (previous_changes.keys & ['use_private', 'use_public', 'use_evaluation']).any? && autograded?
  end

  # Re-grades all submissions to programming_questions after any change to
  # test case booleans has been committed
  def grade_with_new_test_cases
    return unless regrade_programming_answers?
    # Regrade all published submissions' programming answers and update exp points awarded
    submissions.select(&:published?).each do |submission|
      submission.resubmit_programming!
      submission.save!
      submission.mark!
      submission.publish!
    end
  end

  # Somehow autosaving more than 1 level of association doesn't work in Rails 5.2
  def save_tab
    tab.category.save if tab&.category && !tab.category.persisted?
    tab.save if tab && !tab.persisted?
  end
end
