# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponse < ActiveRecord::Base
  acts_as :question, class_name: Course::Assessment::Question.name

  enum grading_scheme: [:all_correct, :any_correct]

  has_many :options, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                     dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :options

  def auto_gradable?
    true
  end

  def auto_grader
    Course::Assessment::Answer::MultipleResponseAutoGradingService.new
  end

  def attempt(submission)
    submission.multiple_response_answers.build(submission: submission, question: question).answer
  end
end
