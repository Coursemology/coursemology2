# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ActiveRecord::Base
  acts_as_lesson_plan_item

  belongs_to :tab, inverse_of: :assessments

  has_many :questions, inverse_of: :assessment, dependent: :destroy do
    include Course::Assessment::QuestionsConcern
  end
  has_many :multiple_response_questions,
           through: :questions, source: :actable,
           source_type: Course::Assessment::Question::MultipleResponse.name
  has_many :submissions, inverse_of: :assessment, dependent: :destroy

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
end
