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
  include Course::ReminderConcern
  include DuplicationStateTrackingConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :propagate_course, if: :new_record?
  before_validation :assign_folder_attributes

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

  validate :tab_in_same_course

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
    course_assessments.*, course_lesson_plan_items.start_at, course_lesson_plan_items.title
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

  def self.use_relative_model_naming?
    true
  end

  def to_partial_path
    'course/assessment/assessments/assessment'.freeze
  end

  # Update assessment mode from params.
  #
  # @param [Hash] params Params with autograded mode from user.
  def update_mode(params)
    target_mode = params[:autograded]
    return if target_mode == autograded || !allow_mode_switching?

    if target_mode == true
      self.autograded = true
      self.password = nil
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

  def password_protected?
    password.present?
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

  private

  # Parents the assessment under its duplicated parent tab, if it exists.
  #
  # @return [Course::Assessment::Tab] The duplicated assessment's tab
  def initialize_duplicate_tab(duplicator, other)
    if duplicator.duplicated?(other.tab)
      target_tab = duplicator.duplicate(other.tab)
    else
      target_category = duplicator.options[:target_course].assessment_categories.first
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
end
