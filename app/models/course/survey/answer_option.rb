# frozen_string_literal: true
class Course::Survey::AnswerOption < ApplicationRecord
  belongs_to :answer, inverse_of: :options
  belongs_to :question_option, class_name: Course::Survey::QuestionOption.name,
                               inverse_of: :answer_options
end
