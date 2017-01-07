# frozen_string_literal: true
# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ActiveRecord::Base
  acts_as_lesson_plan_item has_todo: true
  acts_as_conditional
  has_one_folder

  # Concern must be included below acts_as_lesson_plan_item to override #can_user_start?
  include Course::Assessment::TodoConcern
  include Course::ReminderConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :propagate_course
  before_validation :assign_folder_attributes

  # Other models use after_save, but some assessments are saved multiple times, causing
  # the flag to be cleared too early.
  after_commit :clear_duplication_flag

  validate :validate_presence_of_questions, if: :published?
  validate :validate_only_autograded_questions, if: :autograded?

  belongs_to :tab, inverse_of: :assessments

  # `submissions` association must be put before `questions`, so that all answers will be deleted
  # first when deleting the course. Otherwise due to the foreign key `question_id` in answers table,
  # questions cannot be deleted.
  has_many :submissions, inverse_of: :assessment, dependent: :destroy

  has_many :questions, inverse_of: :assessment, dependent: :destroy do
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
  has_many :assessment_conditions, class_name: Course::Condition::Assessment.name,
                                   inverse_of: :assessment, dependent: :destroy

  scope :published, -> { where(published: true) }

  # @!attribute [r] maximum_grade
  #   Gets the maximum grade allowed by this assessment. This is the sum of all questions'
  #   maximum grade.
  #   @return [Fixnum]
  calculated :maximum_grade, (lambda do
    Course::Assessment::Question.unscope(:order).
      select { coalesce(sum(course_assessment_questions.maximum_grade), 0) }.
      where { course_assessment_questions.assessment_id == course_assessments.id }
  end)

  # @!method self.ordered_by_date
  #   Orders the assessments by the starting date.
  scope :ordered_by_date, (lambda do
    select('course_assessments.*').
      select { lesson_plan_item.start_at }.
      joins { lesson_plan_item }.
      merge(Course::LessonPlan::Item.ordered_by_date)
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

  def permitted_for!(_course_user)
  end

  def precluded_for!(_course_user)
  end

  def password_protected?
    password.present?
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator.time_shift)
    self.folder = duplicator.duplicate(other.folder)
    self.questions = duplicator.duplicate(other.questions.map(&:actable)).compact.map(&:acting_as)
    self.assessment_conditions = duplicator.duplicate(other.assessment_conditions)
    # Like achievement conditions, duplicate the actable object directly and let the acting_as
    # gem create the Condition object.
    self.conditions = duplicator.duplicate(other.conditions.map(&:actable)).map(&:acting_as)
    @duplicating = true
  end

  private

  # Sets the course of the lesson plan item to be the same as the one for the assessment.
  def propagate_course
    lesson_plan_item.course = tab.category.course
  end

  def assign_folder_attributes
    # Folder attributes are handled during duplication by folder duplication code
    return if @duplicating
    folder.assign_attributes(name: title, course: course, parent: tab.category.folder,
                             start_at: start_at)
  end

  def set_defaults
    self.published = false
    self.autograded ||= false
  end

  def validate_presence_of_questions
    errors.add(:published, :no_questions) unless questions.present?
  end

  def validate_only_autograded_questions
    return unless published?
    non_autograded_questions = questions.select { |q| !q.auto_gradable? }
    return if non_autograded_questions.empty?

    message = I18n.t('activerecord.errors.models.course/assessment.autograded',
                     question: non_autograded_questions.first.display_title)
    errors.add(:published, message)
  end

  def clear_duplication_flag
    @duplicating = nil
  end
end
