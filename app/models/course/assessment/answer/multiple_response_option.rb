# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponseOption < ApplicationRecord
  belongs_to :answer, class_name: Course::Assessment::Answer::MultipleResponse.name,
                      inverse_of: :options
  belongs_to :option, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                      inverse_of: nil
end
