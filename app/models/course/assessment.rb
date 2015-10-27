# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ActiveRecord::Base
  acts_as_lesson_plan_item
  has_one_folder

  after_initialize :build_initial_folder, if: :new_record?
  before_validation :assign_folder_attributes
  before_validation :propagate_course

  belongs_to :tab, inverse_of: :assessments

  has_many :questions, inverse_of: :assessment, dependent: :destroy do
    include Course::Assessment::QuestionsConcern
  end
  has_many :multiple_response_questions,
           through: :questions, source: :actable,
           source_type: Course::Assessment::Question::MultipleResponse.name
  has_many :text_response_questions,
           through: :questions, source: :actable,
           source_type: Course::Assessment::Question::TextResponse.name

  has_many :submissions, inverse_of: :assessment, dependent: :destroy

  # @!method with_maximum_grade
  #   Includes the maximum grade allowed by this assessment. This is the sum of all questions'
  #   maximum grade.
  scope :with_maximum_grade, (lambda do
    joins { questions }.
      select { 'course_assessments.*' }.
      select { sum(questions.maximum_grade).as(maximum_grade) }.
      group { course_assessments.id }
  end)

  # @!method with_submissions_by(creator)
  #   Includes the submissions by the provided user.
  #   @param [User] user The user to preload submissions for.
  scope :with_submissions_by, (lambda do |user|
    submissions = Course::Assessment::Submission.by_user(user).
                  where(assessment: pluck(:id)).ordered_by_date

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

  private

  # Sets the course of the lesson plan item to be the same as the one for the assessment.
  def propagate_course
    lesson_plan_item.course = tab.category.course
  end

  def build_initial_folder
    build_folder unless folder
  end

  def assign_folder_attributes
    folder.assign_attributes(name: title, course: course, parent: tab.category.folder,
                             start_at: start_at)
  end
end
