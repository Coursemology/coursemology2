# frozen_string_literal: true
class Course::Survey::AnswerOption < ApplicationRecord
  validates_presence_of :answer
  validates_presence_of :question_option

  belongs_to :answer, inverse_of: :options
  belongs_to :question_option, class_name: Course::Survey::QuestionOption.name,
                               inverse_of: :answer_options
end
