# frozen_string_literal: true
class Course::Survey::AnswerOption < ActiveRecord::Base
  belongs_to :answer, inverse_of: :options
  belongs_to :question_option, class_name: Course::Survey::QuestionOption.name,
                               inverse_of: :answer_options

  validate :question_option_belongs_to_question

  private

  def question_option_belongs_to_question
    errors.add(:question_option_id, :invalid) \
      unless answer.question.option_ids.include?(question_option_id)
  end
end
